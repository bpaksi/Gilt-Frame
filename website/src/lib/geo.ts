import type { DistanceGate } from "@/config/types";

const R = 6371e3; // Earth radius in meters

export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function bearingTo(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export const DEFAULT_DISTANCE_GATES: DistanceGate[] = [
  { above: 200, text: "The Marker is far. Keep searching." },
  { above: 100, text: "You draw closer. The Marker stirs." },
  { above: 50,  text: "The Marker grows warm. You are near." },
  { above: 0,   text: "The Marker burns bright. You have arrived." },
];

export function thematicDistanceText(meters: number, gates = DEFAULT_DISTANCE_GATES): string {
  const sorted = [...gates].sort((a, b) => b.above - a.above);
  return sorted.find((g) => meters > g.above)?.text ?? sorted[sorted.length - 1]?.text ?? "";
}
