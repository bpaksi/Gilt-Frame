"use client";

import { gameConfig, getOrderedSteps } from "@/config";

export default function ChapterEditor() {
  const chapters = Object.entries(gameConfig.chapters);

  return (
    <div>
      {chapters.map(([id, chapter]) => {
        const steps = getOrderedSteps(chapter);
        return (
          <div
            key={id}
            className="admin-card p-4 mb-3"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-[15px] font-semibold text-admin-text-dark">
                  {chapter.name}
                </div>
                <div className="text-[11px] text-admin-text-muted mt-0.5">
                  {id} {chapter.location && `\u2022 ${chapter.location}`} {chapter.window && `\u2022 ${chapter.window}`}
                </div>
              </div>
            </div>

            {steps.length > 0 ? (
              <div className="text-xs text-admin-text">
                {steps.map((step, i) => (
                  <div
                    key={step.id}
                    className={`py-1.5 flex gap-2 items-center transition-colors hover:bg-gray-50 -mx-1 px-1 rounded ${
                      i > 0 ? "border-t border-admin-border-light" : ""
                    }`}
                  >
                    <span className="text-admin-text-faint w-5 text-right text-[10px] tabular-nums">
                      {step.order}
                    </span>
                    <span className="font-medium">{step.name}</span>
                    <span className="text-[10px] text-admin-text-faint uppercase tracking-[0.5px]">
                      {step.type}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-admin-text-faint italic">
                No steps configured yet.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
