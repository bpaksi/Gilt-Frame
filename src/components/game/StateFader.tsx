"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface StateFaderProps {
  stateKey: string;
  children: ReactNode;
}

export default function StateFader({ stateKey, children }: StateFaderProps) {
  const [displayed, setDisplayed] = useState({ key: stateKey, children });
  const [phase, setPhase] = useState<"in" | "out">("in");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Sync children in-place when key hasn't changed (React "adjust state on render" pattern)
  if (stateKey === displayed.key && children !== displayed.children) {
    setDisplayed({ key: stateKey, children });
  }

  // Key changed — start fade out immediately during render
  if (stateKey !== displayed.key && phase !== "out") {
    setPhase("out");
  }

  useEffect(() => {
    if (stateKey === displayed.key) {
      return;
    }

    // After fade-out completes, swap content and fade in
    timeoutRef.current = setTimeout(() => {
      setDisplayed({ key: stateKey, children });
      setPhase("in");
    }, 150);

    return () => clearTimeout(timeoutRef.current);
  }, [stateKey, children, displayed.key]);

  return (
    <div
      style={{
        opacity: phase === "in" ? 1 : 0,
        transition: "opacity 150ms ease-in-out",
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
    >
      {displayed.children}
    </div>
  );
}
