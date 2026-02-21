"use client";

import { useState, useCallback } from "react";

interface ConfigEditorProps {
  value: Record<string, unknown>;
  onApply: (config: Record<string, unknown>) => void;
  onReset: () => void;
}

export default function ConfigEditor({ value, onApply, onReset }: ConfigEditorProps) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [error, setError] = useState<string | null>(null);

  // Sync when external value changes (e.g. component switch)
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setText(JSON.stringify(value, null, 2));
    setError(null);
  }

  const handleApply = useCallback(() => {
    try {
      const parsed = JSON.parse(text);
      setError(null);
      onApply(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  }, [text, onApply]);

  const handleReset = useCallback(() => {
    setText(JSON.stringify(value, null, 2));
    setError(null);
    onReset();
  }, [value, onReset]);

  return (
    <div className="flex flex-col gap-3 flex-1 min-w-0">
      <div className="text-xs font-semibold tracking-widest uppercase text-admin-text-faint">
        Config (JSON)
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        className="admin-input admin-focus flex-1 min-h-[200px] bg-admin-card text-admin-text font-mono text-xs p-3 rounded-md border border-admin-border focus:outline-none resize-y"
      />
      {error && (
        <div className="text-admin-red text-xs font-mono px-1">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <button
          onClick={handleApply}
          className="admin-btn admin-focus px-4 py-2 text-xs font-semibold tracking-wider uppercase bg-admin-blue hover:bg-admin-blue-hover text-white rounded-md transition-colors"
        >
          Apply
        </button>
        <button
          onClick={handleReset}
          className="admin-btn admin-focus px-4 py-2 text-xs font-semibold tracking-wider uppercase bg-admin-surface hover:bg-admin-border text-admin-text-muted rounded-md transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
