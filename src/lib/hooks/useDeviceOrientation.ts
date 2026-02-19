"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface OrientationState {
  heading: number | null;
  error: string | null;
  permissionGranted: boolean;
}

export function useDeviceOrientation() {
  const [state, setState] = useState<OrientationState>({
    heading: null,
    error: null,
    permissionGranted: false,
  });
  const listenerRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null);

  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    // iOS provides webkitCompassHeading directly
    const webkit = (e as DeviceOrientationEvent & { webkitCompassHeading?: number })
      .webkitCompassHeading;
    const heading = webkit ?? (e.alpha !== null ? (360 - e.alpha) % 360 : null);

    setState({
      heading,
      error: null,
      permissionGranted: true,
    });
  }, []);

  const requestPermission = useCallback(async () => {
    // iOS 13+ requires permission request from user gesture
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      "requestPermission" in DeviceOrientationEvent
    ) {
      try {
        const result = await (
          DeviceOrientationEvent as unknown as {
            requestPermission: () => Promise<string>;
          }
        ).requestPermission();
        if (result !== "granted") {
          setState((s) => ({ ...s, error: "Permission denied" }));
          return;
        }
      } catch {
        setState((s) => ({ ...s, error: "Permission request failed" }));
        return;
      }
    }

    listenerRef.current = handleOrientation;
    window.addEventListener("deviceorientation", handleOrientation, true);
  }, [handleOrientation]);

  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        window.removeEventListener("deviceorientation", listenerRef.current, true);
      }
    };
  }, []);

  return { ...state, requestPermission };
}
