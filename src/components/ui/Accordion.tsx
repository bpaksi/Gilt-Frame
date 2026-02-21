"use client";

import { useState, type ReactNode } from "react";
import { colors, fontFamily, MIN_TAP_TARGET } from "./tokens";
import type { ShowcaseDefinition } from "@/components/showcase";

interface AccordionProps<T> {
  items: T[];
  keyExtractor: (item: T, index: number) => string;
  renderHeader: (item: T) => ReactNode;
  renderBody: (item: T) => ReactNode;
}

export default function Accordion<T>({
  items,
  keyExtractor,
  renderHeader,
  renderBody,
}: AccordionProps<T>) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
      {items.map((item, index) => {
        const key = keyExtractor(item, index);
        const isExpanded = expandedKey === key;

        return (
          <div key={key}>
            <button
              onClick={() => setExpandedKey(isExpanded ? null : key)}
              style={{
                width: "100%",
                textAlign: "left",
                background: "none",
                border: "none",
                borderBottom: `1px solid ${colors.gold08}`,
                padding: "14px 0",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                minHeight: MIN_TAP_TARGET,
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {renderHeader(item)}
            </button>

            {isExpanded && (
              <div
                style={{
                  padding: "12px 0 20px 0",
                  animation: "accordion-reveal 0.4s ease forwards",
                }}
              >
                <div
                  style={{
                    color: colors.gold60,
                    fontFamily,
                    fontSize: "14px",
                    fontStyle: "italic",
                    lineHeight: 1.8,
                  }}
                >
                  {renderBody(item)}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

type DemoItem = { title: string; body: string };

export const showcase: ShowcaseDefinition<AccordionProps<DemoItem>> = {
  category: "ui",
  label: "Accordion",
  description: "Expandable list with single-item expansion",
  defaults: {
    items: [
      { title: "The Gilt Frame", body: "A secret order that guards the boundaries between worlds." },
      { title: "The Sparrows", body: "Initiates who seek to prove their worth through trials of perception." },
      { title: "The Oracle", body: "Speak your questions into the dark. Answers come to those who listen." },
    ],
    keyExtractor: (_item, index) => String(index),
    renderHeader: (item) => item.title,
    renderBody: (item) => item.body,
  },
};
