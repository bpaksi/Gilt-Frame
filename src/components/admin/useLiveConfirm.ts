import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Gates an action behind a two-tap confirmation.
 * First tap enters confirm state (auto-resets after 5 s). Second tap executes.
 */
export function useLiveConfirm() {
  const [confirmPending, setConfirmPending] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const gate = useCallback(
    (action: () => void) => {
      if (!confirmPending) {
        setConfirmPending(true);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setConfirmPending(false), 5000);
      } else {
        setConfirmPending(false);
        clearTimeout(timerRef.current);
        action();
      }
    },
    [confirmPending],
  );

  const reset = useCallback(() => {
    setConfirmPending(false);
    clearTimeout(timerRef.current);
  }, []);

  return { confirmPending, gate, reset };
}
