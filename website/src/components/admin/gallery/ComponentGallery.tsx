"use client";

import { useState, useCallback, useTransition, useRef, type ReactNode } from "react";
import type { ShowcaseCategory } from "@/components/showcase";
import type { ComponentConfig } from "@/config";
import { getEntriesByCategory, getEntryById, getUsedBy, type ShowcaseEntry } from "./showcaseRegistry";
import { getPresets, type Preset } from "./presets";
import GameViewport, { DEVICE_SIZES, type DeviceSize } from "./GameViewport";
import ConfigEditor from "./ConfigEditor";
import {
  gallerySetup,
  galleryCleanup,
  galleryRevealHint,
  galleryRecordAnswer,
} from "@/lib/actions/gallery";
import { colors, fontFamily } from "@/components/ui/tokens";

const CATEGORIES: { key: ShowcaseCategory; label: string }[] = [
  { key: "ui", label: "UI" },
  { key: "game", label: "Game" },
  { key: "quest", label: "Quest" },
];

const presets = getPresets();

// Group presets by component name
const presetsByComponent = new Map<string, Preset[]>();
for (const preset of presets) {
  const existing = presetsByComponent.get(preset.component) ?? [];
  existing.push(preset);
  presetsByComponent.set(preset.component, existing);
}

type GalleryContext = {
  stepProgressId: string | null;
  chapterId: string;
  stepIndex: number;
};

interface ComponentGalleryProps {
  initialContext: {
    stepProgressId: string;
    chapterId: string;
    stepIndex: number;
  };
  initialComponent: string;
  initialConfig: ComponentConfig;
}

export default function ComponentGallery({
  initialContext,
  initialComponent,
  initialConfig,
}: ComponentGalleryProps) {
  const [category, setCategory] = useState<ShowcaseCategory>("quest");
  const [selectedId, setSelectedId] = useState(initialComponent);
  const [config, setConfig] = useState<Record<string, unknown>>(
    initialConfig as unknown as Record<string, unknown>
  );
  const [originalConfig, setOriginalConfig] = useState<Record<string, unknown>>(
    initialConfig as unknown as Record<string, unknown>
  );
  const [device, setDevice] = useState<DeviceSize>(DEVICE_SIZES[1]); // iPhone 14
  const [mountKey, setMountKey] = useState(0);
  const [ctx, setCtx] = useState<GalleryContext>(initialContext);
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const entries = getEntriesByCategory(category);
  const entry = getEntryById(selectedId);

  // Get presets for the current component
  const componentPresets = entry ? presetsByComponent.get(entry.id) ?? [] : [];

  // Select a component from the list
  const handleSelectComponent = useCallback(
    (newEntry: ShowcaseEntry) => {
      setError(null);

      if (newEntry.showcase.category === "quest") {
        // For quest components, use first available preset
        const entryPresets = presetsByComponent.get(newEntry.id);
        if (entryPresets && entryPresets.length > 0) {
          const preset = entryPresets[0];
          const newConfig = preset.config as unknown as Record<string, unknown>;
          setConfig(newConfig);
          setOriginalConfig(newConfig);
          // Set selectedId synchronously with config so they're always in the same batch.
          // This prevents an intermediate render where config has changed but selectedId
          // still points to the old component, which could cause the new component to
          // receive the wrong config if gallerySetup fails or async interleaving occurs.
          setSelectedId(newEntry.id);
          setIsDone(false);

          startTransition(async () => {
            try {
              if (ctx.stepProgressId) {
                await galleryCleanup(ctx.stepProgressId);
              }
              const result = await gallerySetup(preset.chapterId, preset.stepIndex);
              setCtx({
                stepProgressId: result.stepProgressId,
                chapterId: preset.chapterId,
                stepIndex: preset.stepIndex,
              });
              setMountKey((k) => k + 1);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Setup failed");
            }
          });
          return;
        }

        // No presets — use showcase defaults.config (not the full defaults object,
        // which also contains onAdvance etc. that buildComponentProps provides separately)
        const showcaseDefaults = newEntry.showcase.defaults as Record<string, unknown> | undefined;
        const configFromDefaults = (showcaseDefaults?.config ?? {}) as Record<string, unknown>;
        setConfig(configFromDefaults);
        setOriginalConfig(configFromDefaults);
        setSelectedId(newEntry.id);
        setIsDone(false);
        setMountKey((k) => k + 1);
        return;
      }

      // For UI/game components, use showcase defaults
      const defaults = (newEntry.showcase.defaults ?? {}) as Record<string, unknown>;
      setConfig(defaults);
      setOriginalConfig(defaults);
      setSelectedId(newEntry.id);
      setIsDone(false);
      setMountKey((k) => k + 1);
    },
    [ctx.stepProgressId],
  );

  // Select a specific preset
  const handleSelectPreset = useCallback(
    (preset: Preset) => {
      setError(null);
      const newConfig = preset.config as unknown as Record<string, unknown>;
      setConfig(newConfig);
      setOriginalConfig(newConfig);

      startTransition(async () => {
        try {
          if (ctx.stepProgressId) {
            await galleryCleanup(ctx.stepProgressId);
          }
          const result = await gallerySetup(preset.chapterId, preset.stepIndex);
          setCtx({
            stepProgressId: result.stepProgressId,
            chapterId: preset.chapterId,
            stepIndex: preset.stepIndex,
          });
          setIsDone(false);
          setMountKey((k) => k + 1);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Setup failed");
        }
      });
    },
    [ctx.stepProgressId],
  );

  const handleApplyConfig = useCallback((newConfig: Record<string, unknown>) => {
    setConfig(newConfig);
    setIsDone(false);
    setMountKey((k) => k + 1);
  }, []);

  const handleReset = useCallback(() => {
    setError(null);
    setIsDone(false);
    setConfig(originalConfig);

    startTransition(async () => {
      try {
        if (ctx.stepProgressId) {
          await galleryCleanup(ctx.stepProgressId);
        }
        const result = await gallerySetup(ctx.chapterId, ctx.stepIndex);
        setCtx((prev) => ({ ...prev, stepProgressId: result.stepProgressId }));
        setMountKey((k) => k + 1);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Reset failed");
      }
    });
  }, [originalConfig, ctx.stepProgressId, ctx.chapterId, ctx.stepIndex]);

  // Navigate to any component by ID (switches category if needed)
  const navigateTo = useCallback(
    (id: string) => {
      const target = getEntryById(id);
      if (!target) return;
      if (target.showcase.category !== category) setCategory(target.showcase.category);
      handleSelectComponent(target);
    },
    [category, handleSelectComponent],
  );

  const usedByIds = entry ? getUsedBy(entry.id) : [];
  const usesIds = entry?.showcase.uses ?? [];

  // Build props for the rendered component
  const onDone = useCallback(() => setIsDone(true), []);
  const componentProps = buildComponentProps(entry, config, ctx, setError, onDone);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Category tabs */}
      <div className="flex gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => {
              setCategory(cat.key);
              const first = getEntriesByCategory(cat.key)[0];
              if (first) handleSelectComponent(first);
            }}
            className={`admin-focus px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded-md transition-colors ${
              category === cat.key
                ? "bg-admin-blue text-white"
                : "bg-admin-surface text-admin-text-muted hover:bg-admin-border hover:text-admin-text"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Component picker + device selector row */}
      <div className="flex gap-3 items-center flex-wrap">
        <select
          value={selectedId}
          onChange={(e) => {
            const found = entries.find((ent) => ent.id === e.target.value);
            if (found) handleSelectComponent(found);
          }}
          className="admin-input admin-focus bg-admin-card text-admin-text text-sm px-3 py-2 rounded-md border border-admin-border focus:outline-none"
        >
          {[...entries].sort((a, b) => a.showcase.label.localeCompare(b.showcase.label)).map((ent) => (
            <option key={ent.id} value={ent.id}>
              {ent.showcase.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => { setIsDone(false); setMountKey((k) => k + 1); }}
          className="admin-btn admin-focus px-3 py-2 text-xs font-semibold tracking-wider uppercase bg-admin-surface hover:bg-admin-border text-admin-text-muted rounded-md transition-colors"
        >
          ↺ Refresh
        </button>

        {componentPresets.length > 1 && (
          <select
            onChange={(e) => {
              const idx = parseInt(e.target.value, 10);
              const preset = componentPresets[idx];
              if (preset) handleSelectPreset(preset);
            }}
            className="admin-input admin-focus bg-admin-card text-admin-text text-sm px-3 py-2 rounded-md border border-admin-border focus:outline-none"
          >
            {componentPresets.map((p, i) => (
              <option key={p.label} value={i}>
                {p.label}
              </option>
            ))}
          </select>
        )}

        <select
          value={device.label}
          onChange={(e) => {
            const d = DEVICE_SIZES.find((s) => s.label === e.target.value);
            if (d) setDevice(d);
          }}
          className="admin-input admin-focus bg-admin-card text-admin-text text-sm px-3 py-2 rounded-md border border-admin-border focus:outline-none ml-auto"
        >
          {DEVICE_SIZES.map((d) => (
            <option key={d.label} value={d.label}>
              {d.label} ({d.width}×{d.height})
            </option>
          ))}
        </select>
      </div>

      {/* Component info panel */}
      {entry && (
        <div className="rounded-md bg-admin-surface border border-admin-border px-3 py-2">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="font-mono text-admin-text text-sm font-semibold">{entry.id}</span>
            <CopyFilePath filePath={entry.filePath} />
            <span className="text-admin-text-faint text-xs italic ml-auto">{entry.showcase.description}</span>
          </div>
        </div>
      )}

      {/* Main area: viewport + config editor side by side */}
      <div className="flex gap-6 flex-1 min-h-0 items-start">
        {/* Viewport column */}
        <div className="flex flex-col gap-3 items-center flex-shrink-0">
          <GameViewport device={device}>
            {isDone ? (
              <DoneOverlay onRefresh={handleReset} />
            ) : (
              <ErrorBoundary
                key={mountKey}
                fallback={(err) => (
                  <div className="flex items-center justify-center flex-1 p-6 text-red-400 text-sm font-mono text-center">
                    {err}
                  </div>
                )}
              >
                {entry && category !== "quest" ? (
                  <div
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      padding: "24px 20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      border: `1px dashed ${colors.gold30}`,
                      margin: "12px",
                      borderRadius: "4px",
                    }}
                  >
                    <entry.Component {...componentProps} />
                  </div>
                ) : entry ? (
                  <entry.Component {...componentProps} />
                ) : null}
              </ErrorBoundary>
            )}
          </GameViewport>

          {isPending && (
            <span className="text-admin-text-faint text-xs italic">Setting up...</span>
          )}
          {error && (
            <span className="text-red-400 text-xs font-mono">{error}</span>
          )}
        </div>

        {/* Config editor + relationships */}
        <div className="flex flex-col gap-3 flex-1">
          <ConfigEditor
            value={config}
            onApply={handleApplyConfig}
            onReset={handleReset}
          />
          {(usesIds.length > 0 || usedByIds.length > 0) && (
            <div className="flex flex-col gap-0.5">
              {usesIds.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-admin-text-faint text-xs">Uses:</span>
                  {usesIds.map((id) => (
                    <button
                      key={id}
                      onClick={() => navigateTo(id)}
                      className="admin-focus text-xs text-admin-blue hover:underline"
                    >
                      {id}
                    </button>
                  ))}
                </div>
              )}
              {usedByIds.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-admin-text-faint text-xs">Used by:</span>
                  {usedByIds.map((id) => (
                    <button
                      key={id}
                      onClick={() => navigateTo(id)}
                      className="admin-focus text-xs text-admin-blue hover:underline"
                    >
                      {id}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {entry?.showcase.tips && entry.showcase.tips.length > 0 && (
            <div className="rounded-md bg-admin-surface border border-admin-border px-3 py-2 flex flex-col gap-1">
              <span className="text-admin-text-faint text-xs font-semibold uppercase tracking-wider">Testing tips</span>
              {entry.showcase.tips.map((tip, i) => (
                <span key={i} className="text-admin-text-muted text-xs leading-relaxed">· {tip}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Copy File Path ────────────────────────────────────────────────────────────

function CopyFilePath({ filePath }: { filePath: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(filePath).then(() => {
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1500);
    });
  }, [filePath]);

  return (
    <button
      onClick={handleCopy}
      className="admin-focus flex items-center gap-1.5 group relative"
    >
      <span className="font-mono text-admin-text-faint text-xs group-hover:text-admin-text transition-colors">
        {filePath}
      </span>
      <span className="text-admin-text-faint text-xs transition-colors">
        {copied ? "✓" : "⎘"}
      </span>
      <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-admin-blue px-2 py-0.5 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
        {copied ? "Copied!" : "Copy path"}
      </span>
    </button>
  );
}

// ── Done Overlay ───────────────────────────────────────────────────────────────

function DoneOverlay({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        background: "rgba(0,0,0,0.6)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "36px", lineHeight: 1 }}>✓</span>
        <span
          style={{
            color: colors.gold80,
            fontFamily,
            fontSize: "13px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Component Done
        </span>
      </div>
      <button
        onClick={onRefresh}
        style={{
          background: "transparent",
          border: `1px solid ${colors.gold30}`,
          color: colors.gold80,
          fontFamily,
          fontSize: "12px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          padding: "8px 20px",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        ↺ Refresh
      </button>
    </div>
  );
}

// ── Helper: build component props ─────────────────────────────────────────────

function buildComponentProps(
  entry: ShowcaseEntry | undefined,
  config: Record<string, unknown>,
  ctx: GalleryContext,
  setError: (msg: string | null) => void,
  onDone: () => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> {
  if (!entry) return {};

  const noop = () => {};

  // Registry of gallery-scoped implementations for "action" callbacks.
  // Each key matches a prop name declared as "action" in a component's showcase.callbacks.
  // ctx.chapterId/stepIndex are captured so GAME-tier components receive a pre-bound closure
  // matching the same (tier: number) => Promise<void> signature used in live gameplay.
  const actionRegistry: Record<string, unknown> = {
    onHintReveal: async (tier: number) => {
      try { await galleryRevealHint(ctx.chapterId, ctx.stepIndex, tier); }
      catch { /* swallow — gallery is best-effort */ }
    },
  };

  const wire = (role: "done" | "noop" | "action", key: string) => {
    if (role === "done") return onDone;
    if (role === "action") return actionRegistry[key] ?? noop;
    return noop;
  };

  // ── Quest ──────────────────────────────────────────────────────────────────
  // Quest components have a universal contract: onAdvance signals completion.
  // onHintReveal and onAnswerRecord are pre-bound closures over ctx so the
  // components never need to know chapterId/stepIndex directly.
  if (entry.showcase.category === "quest") {
    const base: Record<string, unknown> = {
      config,
      onAdvance: onDone,
      revealedHintTiers: [],
    };

    base.onHintReveal = async (tier: number) => {
      try {
        await galleryRevealHint(ctx.chapterId, ctx.stepIndex, tier);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Hint reveal failed");
      }
    };

    base.onAnswerRecord = async (
      questionIndex: number,
      selectedOption: string,
      correct: boolean,
    ) => {
      try {
        await galleryRecordAnswer(ctx.chapterId, ctx.stepIndex, questionIndex, selectedOption, correct);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Record answer failed");
      }
    };

    return base;
  }

  // ── Game & UI ──────────────────────────────────────────────────────────────
  // Callbacks are declared generically in each component's showcase.callbacks.
  // Action injections (async server actions) are the only per-component specials.
  const props: Record<string, unknown> = { ...config };

  // Wire all declared callbacks from the showcase definition
  for (const [key, role] of Object.entries(entry.showcase.callbacks ?? {})) {
    props[key] = wire(role, key);
  }

  return props;
}

// ── Error Boundary ────────────────────────────────────────────────────────────

import { Component, type ErrorInfo } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: (error: string) => ReactNode;
}

interface ErrorBoundaryState {
  error: string | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Gallery component error:", error, info);
  }

  render() {
    if (this.state.error) {
      return this.props.fallback(this.state.error);
    }
    return this.props.children;
  }
}
