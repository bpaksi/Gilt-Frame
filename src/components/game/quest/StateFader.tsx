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

  useEffect(() => {
    if (stateKey === displayed.key) {
      // Children changed but key is same — update in place
      setDisplayed({ key: stateKey, children });
      return;
    }

    // Key changed — fade out, then swap
    setPhase("out");
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
