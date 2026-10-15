import { useCallback } from "react";

export function useShareAction(shareToken: string) {
  return useCallback(async () => {
    const url = `${window.location.origin}/moment/${shareToken}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "A Moment from the Order", url });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  }, [shareToken]);
}
