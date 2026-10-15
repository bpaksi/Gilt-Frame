"use client";

import { useState, useCallback, type ReactNode } from "react";
import { colors, fontFamily, MIN_TAP_TARGET } from "./tokens";
import type { ShowcaseDefinition } from "@/components/showcase";

interface AccordionItem {
  title: ReactNode;
  body: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
}

export default function Accordion({ items }: AccordionProps) {
  // Which item's body is currently rendered in the DOM (open or mid-close)
  const [displayedIndex, setDisplayedIndex] = useState<number | null>(null);
  // Whether the rendered panel is expanded (1fr) or collapsed (0fr)
  const [isOpen, setIsOpen] = useState(false);
  // Item waiting to open after the current close animation finishes
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);

  // True while a close or close→open sequence is in progress
  const isTransitioning = (!isOpen && displayedIndex !== null) || pendingIndex !== null;

  const handleClick = useCallback(
    (index: number) => {
      if (isTransitioning) return;

      if (index === displayedIndex && isOpen) {
        // Collapse the open item
        setIsOpen(false);
      } else if (isOpen && displayedIndex !== null) {
        // Different item: close current first, queue the new one
        setIsOpen(false);
        setPendingIndex(index);
      } else {
        // Nothing open — mount the panel then open it next frames
        setDisplayedIndex(index);
        requestAnimationFrame(() => requestAnimationFrame(() => setIsOpen(true)));
      }
    },
    [displayedIndex, isOpen, isTransitioning]
  );

  const handleTransitionEnd = useCallback(
    (e: React.TransitionEvent) => {
      // Only react to the height transition, not opacity/transform bubbling up
      if (e.propertyName !== "grid-template-rows") return;
      if (isOpen) return; // fired on the open transition — nothing to do

      if (pendingIndex !== null) {
        // Swap content then open
        const next = pendingIndex;
        setPendingIndex(null);
        setDisplayedIndex(next);
        requestAnimationFrame(() => requestAnimationFrame(() => setIsOpen(true)));
      } else {
        // Plain close — remove the panel from DOM
        setDisplayedIndex(null);
      }
    },
    [isOpen, pendingIndex]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
      {items.map((item, index) => (
        <div key={index}>
          <button
            onClick={() => handleClick(index)}
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
            {item.title}
          </button>

          {displayedIndex === index && (
            // Outer div drives height via grid-template-rows transition
            <div
              onTransitionEnd={handleTransitionEnd}
              style={{
                display: "grid",
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                transition: "grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {/* Inner div clips overflow and fades content */}
              <div
                style={{
                  overflow: "hidden",
                  opacity: isOpen ? 1 : 0,
                  transform: isOpen ? "translateY(0)" : "translateY(-6px)",
                  transition: "opacity 0.25s ease, transform 0.25s ease",
                  transitionDelay: isOpen ? "0.08s" : "0s",
                }}
              >
                <div
                  style={{
                    padding: "12px 0 20px 0",
                    color: colors.gold60,
                    fontFamily,
                    fontSize: "14px",
                    fontStyle: "italic",
                    lineHeight: 1.8,
                  }}
                >
                  {item.body}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export const showcase: ShowcaseDefinition<AccordionProps> = {
  category: "ui",
  label: "Accordion",
  description: "Expandable list with single-item expansion",
  defaults: {
    items: [
      { title: "The Gilt Frame", body: "A secret order that guards the boundaries between worlds." },
      { title: "The Sparrows", body: "Initiates who seek to prove their worth through trials of perception." },
      { title: "The Oracle", body: "Speak your questions into the dark. Answers come to those who listen." },
    ],
  },
};
