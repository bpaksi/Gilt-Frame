"use client";

import { useEffect, useState, useCallback } from "react";

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

  // Always listen for orientation events.
  // - Android: use 'deviceorientationabsolute' which gives north-relative alpha.
  // - iOS: use 'deviceorientation' which provides webkitCompassHeading.
  //   Events only fire after requestPermission() grants access on iOS 13+,
  //   but registering the listener early is harmless and means ALL hook
  //   instances receive data once any one of them obtains permission.
  useEffect(() => {
    const event =
      "ondeviceorientationabsolute" in window
        ? "deviceorientationabsolute"
        : "deviceorientation";
    window.addEventListener(event, handleOrientation as EventListener, true);
    return () => window.removeEventListener(event, handleOrientation as EventListener, true);
  }, [handleOrientation]);

  // Request iOS 13+ permission from a user gesture.
  // Returns true if permission was granted, false if denied/error.
  const requestPermission = useCallback(async (): Promise<boolean> => {
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
          return false;
        }
      } catch {
        setState((s) => ({ ...s, error: "Permission request failed" }));
        return false;
      }
    }

    return true;
  }, []);

  return { ...state, requestPermission };
}
