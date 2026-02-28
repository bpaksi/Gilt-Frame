"use client";

import { useEffect, useState, useCallback } from "react";

// ── Module-level singleton state ──────────────────────────────────────────────
// One global event listener, shared heading. All hook instances subscribe via
// pub/sub so that a single requestPermission() grant feeds every consumer.

type Subscriber = () => void;

let heading: number | null = null;
let error: string | null = null;
let permissionGranted = false;
const subscribers = new Set<Subscriber>();
let listenerCount = 0;

function notify() {
  for (const sub of subscribers) sub();
}

function getEventName(): string {
  return "ondeviceorientationabsolute" in window
    ? "deviceorientationabsolute"
    : "deviceorientation";
}

function handleOrientationEvent(e: DeviceOrientationEvent) {
  const webkit = (e as DeviceOrientationEvent & { webkitCompassHeading?: number })
    .webkitCompassHeading;
  heading = webkit ?? (e.alpha !== null ? (360 - e.alpha) % 360 : null);
  error = null;
  permissionGranted = true;
  notify();
}

function addGlobalListener() {
  const event = getEventName();
  window.addEventListener(event, handleOrientationEvent as EventListener, true);
}

function removeGlobalListener() {
  const event = getEventName();
  window.removeEventListener(event, handleOrientationEvent as EventListener, true);
}

// ── Hook ──────────────────────────────────────────────────────────────────────

interface OrientationState {
  heading: number | null;
  error: string | null;
  permissionGranted: boolean;
}

export function useDeviceOrientation() {
  const [state, setState] = useState<OrientationState>({
    heading,
    error,
    permissionGranted,
  });

  // Subscribe to module-level state changes; ref-count the global listener.
  useEffect(() => {
    const sub = () => setState({ heading, error, permissionGranted });
    subscribers.add(sub);

    if (listenerCount === 0) addGlobalListener();
    listenerCount++;

    // Sync in case state changed between render and effect
    sub();

    return () => {
      subscribers.delete(sub);
      listenerCount--;
      if (listenerCount === 0) removeGlobalListener();
    };
  }, []);

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
          error = "Permission denied";
          notify();
          return false;
        }
      } catch {
        error = "Permission request failed";
        notify();
        return false;
      }

      // iOS requires the listener to be (re-)registered after permission is
      // granted — listeners added before the grant never receive events.
      // Remove + re-add the single global listener so ALL subscribers benefit.
      removeGlobalListener();
      addGlobalListener();
    }

    return true;
  }, []);

  return { ...state, requestPermission };
}
