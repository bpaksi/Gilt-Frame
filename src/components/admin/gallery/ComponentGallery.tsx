"use client";

import { useState, useCallback, useTransition, type ReactNode } from "react";
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
  galleryValidatePassphrase,
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
              setSelectedId(newEntry.id);
              setMountKey((k) => k + 1);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Setup failed");
            }
          });
          return;
        }
      }

      // For UI/game components, use showcase defaults
      const defaults = (newEntry.showcase.defaults ?? {}) as Record<string, unknown>;
      setConfig(defaults);
      setOriginalConfig(defaults);
      setSelectedId(newEntry.id);
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
    setMountKey((k) => k + 1);
  }, []);

  const handleReset = useCallback(() => {
    setError(null);
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
  const componentProps = buildComponentProps(entry, config, ctx, setError);

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
          {entries.map((ent) => (
            <option key={ent.id} value={ent.id}>
              {ent.showcase.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => setMountKey((k) => k + 1)}
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
            <span className="font-mono text-admin-text-faint text-xs">{entry.filePath}</span>
            <span className="text-admin-text-faint text-xs italic ml-auto">{entry.showcase.description}</span>
          </div>
        </div>
      )}

      {/* Main area: viewport + config editor side by side */}
      <div className="flex gap-6 flex-1 min-h-0 items-start">
        {/* Viewport column */}
        <div className="flex flex-col gap-3 items-center flex-shrink-0">
          <GameViewport device={device}>
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
        </div>
      </div>
    </div>
  );
}

// ── Helper: build component props ─────────────────────────────────────────────

function buildComponentProps(
  entry: ShowcaseEntry | undefined,
  config: Record<string, unknown>,
  ctx: GalleryContext,
  setError: (msg: string | null) => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> {
  if (!entry) return {};

  const noop = () => {};

  // Quest components get config + action props
  if (entry.showcase.category === "quest") {
    const base: Record<string, unknown> = {
      config,
      onAdvance: noop,
      chapterId: ctx.chapterId,
      stepIndex: ctx.stepIndex,
      revealedHintTiers: [],
    };

    // Inject gallery action props
    base.revealHintAction = async (chapterId: string, stepIndex: number, tier: number) => {
      try {
        return await galleryRevealHint(chapterId, stepIndex, tier);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Hint reveal failed");
        return null;
      }
    };

    base.recordAnswerAction = async (
      chapterId: string,
      stepIndex: number,
      questionIndex: number,
      selectedOption: string,
      correct: boolean,
    ) => {
      try {
        await galleryRecordAnswer(chapterId, stepIndex, questionIndex, selectedOption, correct);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Record answer failed");
      }
    };

    // PassphraseEntry: inject validate action
    if (entry.id === "PassphraseEntry") {
      const passphrase = (config as { passphrase?: string }).passphrase ?? "";
      base.validatePassphraseAction = async (input: string) => {
        try {
          return await galleryValidatePassphrase(input, passphrase);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Validation failed");
          return { success: false, error: "Validation failed" };
        }
      };
    }

    // StoryReveal: pass chapterName
    if (entry.id === "StoryReveal") {
      base.chapterName = "Gallery Preview";
    }

    return base;
  }

  // Game building blocks — use their showcase defaults merged with config
  if (entry.showcase.category === "game") {
    const props: Record<string, unknown> = { ...config };

    // Components that need callback props
    if (entry.id === "CompassPermission") props.onPermission = noop;
    if (entry.id === "IndoorWayfinding") {
      props.config = config;
      props.onAdvance = noop;
      props.chapterId = "gallery";
      props.stepIndex = 0;
      props.revealHintAction = async (chapterId: string, stepIndex: number, tier: number) => {
        try {
          return await galleryRevealHint(chapterId, stepIndex, tier);
        } catch {
          return null;
        }
      };
    }
    if (entry.id === "MarkerAnimation") props.onComplete = noop;
    if (entry.id === "CeremonyAnimation") props.onUnlock = noop;
    if (entry.id === "HintSystem") {
      props.revealHintAction = async (chapterId: string, stepIndex: number, tier: number) => {
        try {
          return await galleryRevealHint(chapterId, stepIndex, tier);
        } catch {
          return null;
        }
      };
    }

    return props;
  }

  // UI primitives — use config directly as props
  const props: Record<string, unknown> = { ...config };

  // Accordion needs special render props
  if (entry.id === "Accordion") {
    props.items = ["The Summons", "The Trial of Sight", "The Hidden Gallery"];
    props.keyExtractor = (_: string, i: number) => String(i);
    props.renderHeader = (item: string) => (
      <span style={{ color: colors.gold80, fontFamily: fontFamily, fontSize: "15px", fontStyle: "italic" }}>
        {item}
      </span>
    );
    props.renderBody = (item: string) => (
      <span>{item} — details of this chapter.</span>
    );
  }

  // OptionButton: add onClick
  if (entry.id === "OptionButton") props.onClick = noop;

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
