"use client";

import { useEffect, useState, useCallback } from "react";

// ── Module-level singleton state ──────────────────────────────────────────────
// One global event listener, shared heading. All hook instances subscribe via
// pub/sub so that a single requestPermission() grant feeds every consumer.
//
// GPS course blending: when the device is moving, GPS provides a reliable
// heading that is immune to magnetic interference (e.g. in a car). We blend
// between magnetometer and GPS course based on speed:
//   - speed < 0.5 m/s  → pure magnetometer
//   - speed 0.5–1.5 m/s → linear blend
//   - speed > 1.5 m/s  → pure GPS course

type Subscriber = () => void;

let magnetHeading: number | null = null;
let gpsCourse: number | null = null;
let gpsSpeed: number | null = null;
let heading: number | null = null;
let error: string | null = null;
let permissionGranted = false;
let debugSource: string = "none";
const subscribers = new Set<Subscriber>();
let listenerCount = 0;

const SPEED_LOW = 0.5;   // m/s — below this, pure magnetometer
const SPEED_HIGH = 1.5;  // m/s — above this, pure GPS course

function notify() {
  for (const sub of subscribers) sub();
}

function blendHeading(): number | null {
  // No magnetometer and no GPS → null
  if (magnetHeading === null && gpsCourse === null) return null;

  // Only one source available → use it
  if (gpsCourse === null || gpsSpeed === null || gpsSpeed < SPEED_LOW) {
    return magnetHeading;
  }
  if (magnetHeading === null || gpsSpeed >= SPEED_HIGH) {
    return gpsCourse;
  }

  // Blend zone — interpolate via shortest angular path
  const t = (gpsSpeed - SPEED_LOW) / (SPEED_HIGH - SPEED_LOW);
  let diff = gpsCourse - magnetHeading;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return ((magnetHeading + diff * t) % 360 + 360) % 360;
}

function updateDebugSource() {
  if (gpsSpeed !== null && gpsSpeed >= SPEED_HIGH && gpsCourse !== null) {
    debugSource = `gps:${gpsCourse.toFixed(0)}`;
  } else if (gpsSpeed !== null && gpsSpeed >= SPEED_LOW && gpsCourse !== null && magnetHeading !== null) {
    const t = ((gpsSpeed - SPEED_LOW) / (SPEED_HIGH - SPEED_LOW) * 100).toFixed(0);
    debugSource = `blend:${t}% gps`;
  } else if (magnetHeading !== null) {
    debugSource = `mag:${magnetHeading.toFixed(0)}`;
  } else {
    debugSource = "none";
  }
}

function getEventName(): string {
  return "ondeviceorientationabsolute" in window
    ? "deviceorientationabsolute"
    : "deviceorientation";
}

function handleOrientationEvent(e: DeviceOrientationEvent) {
  const webkit = (e as DeviceOrientationEvent & { webkitCompassHeading?: number })
    .webkitCompassHeading;
  magnetHeading = webkit ?? (e.alpha !== null ? (360 - e.alpha) % 360 : null);
  heading = blendHeading();
  updateDebugSource();
  error = null;
  permissionGranted = true;
  notify();
}

/** Called by useGeolocation to feed GPS course data into the heading blend. */
export function feedGpsCourse(course: number | null, speed: number | null) {
  gpsCourse = course;
  gpsSpeed = speed;
  heading = blendHeading();
  updateDebugSource();
  // Only notify if we have subscribers — avoids work when no orientation hook mounted
  if (subscribers.size > 0) notify();
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
  debugSource: string;
}

export function useDeviceOrientation() {
  const [state, setState] = useState<OrientationState>({
    heading,
    error,
    permissionGranted,
    debugSource,
  });

  // Subscribe to module-level state changes; ref-count the global listener.
  useEffect(() => {
    const sub = () => setState({ heading, error, permissionGranted, debugSource });
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
