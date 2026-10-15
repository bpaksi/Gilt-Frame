import { useState, useEffect, useRef } from "react";

interface UseStaggeredRevealOptions {
  /** Lines to stagger in. Pass empty array for no-line mode. */
  lines: string[];
  /** When false, resets all states. When true, starts the animation. */
  active?: boolean;
  /** Ms after lines settle (or from start if no lines) before marker appears. */
  markerDelay?: number;
  /** Ms after marker before text appears. */
  textDelay?: number;
  /** Ms after marker before tap is ready. */
  tapDelay?: number;
}

export function useStaggeredReveal({
  lines,
  active = true,
  markerDelay,
  textDelay,
  tapDelay,
}: UseStaggeredRevealOptions) {
  const [lineVisibility, setLineVisibility] = useState<boolean[]>([]);
  const [markerVisible, setMarkerVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [tapReady, setTapReady] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Reset state when active transitions to false (derived state pattern)
  const [prevActive, setPrevActive] = useState(active);
  if (prevActive !== active) {
    setPrevActive(active);
    if (!active) {
      setLineVisibility([]);
      setMarkerVisible(false);
      setTextVisible(false);
      setTapReady(false);
    }
  }

  useEffect(() => {
    if (!active) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const hasLines = lines.length > 0;

    // Stagger title lines: each line appears at i * 500 + 400ms
    if (hasLines) {
      lines.forEach((_, i) => {
        timers.push(
          setTimeout(() => {
            setLineVisibility((prev) => {
              const next = [...prev];
              next[i] = true;
              return next;
            });
          }, i * 500 + 400),
        );
      });
    }

    // Compute timing relative to line settle point
    const lineSettleMs = hasLines ? (lines.length - 1) * 500 + 400 + 800 : 0;
    const markerMs = lineSettleMs + (markerDelay ?? (hasLines ? 1500 : 1200));
    const textMs = markerMs + (textDelay ?? (hasLines ? 1200 : 1600));
    const tapMs = markerMs + (tapDelay ?? (hasLines ? 1600 : 2000));

    timers.push(setTimeout(() => setMarkerVisible(true), markerMs));
    timers.push(setTimeout(() => setTextVisible(true), textMs));
    timers.push(setTimeout(() => setTapReady(true), tapMs));

    timersRef.current = timers;
    return () => {
      timers.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [active, lines, markerDelay, textDelay, tapDelay]);

  return { lineVisibility, markerVisible, textVisible, tapReady };
}
