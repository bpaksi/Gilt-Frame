export function easeInOut(t: number) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
export function easeOut(t: number) { return 1 - Math.pow(1 - t, 3); }
export function easeIn(t: number) { return t * t; }
export function clamp01(t: number) { return Math.max(0, Math.min(1, t)); }
export function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
export function prog(elapsed: number, phase: { start: number; end: number }) {
  return clamp01((elapsed - phase.start) / (phase.end - phase.start));
}

export const TIMELINE = {
  gather:     { start: 0,     end: 2000 },
  flash:      { start: 1800,  end: 3000 },
  corner:     { start: 3000,  end: 4000 },
  loop:       { start: 4000,  end: 7500 },
  returnC:    { start: 7500,  end: 8500 },
  fade:       { start: 8500,  end: 9800 },
  hourglass:  { start: 9200,  end: 10500 },
  pulse:      { start: 10500, end: 99999 },
  unlock:     { start: 11000, end: 99999 },
};

export const FRAME_X = 10;
export const FRAME_Y = 10;
export const FRAME_W = 180;
export const FRAME_H = 240;
export const PERIMETER = 2 * (FRAME_W + FRAME_H);
export const CENTER_X = 100;
export const CENTER_Y = 130;
export const TRAIL_COUNT = 4;
export const TRAIL_LAG = 0.018;
export const TRAIL_RADII = [6, 5, 4, 3];
export const TRAIL_OPACITIES = [0.35, 0.25, 0.15, 0.08];

export function pointOnBorder(frac: number): { x: number; y: number } {
  const dist = (frac % 1) * PERIMETER;
  if (dist < FRAME_W) return { x: FRAME_X + dist, y: FRAME_Y };
  if (dist < FRAME_W + FRAME_H) return { x: FRAME_X + FRAME_W, y: FRAME_Y + (dist - FRAME_W) };
  if (dist < 2 * FRAME_W + FRAME_H) return { x: FRAME_X + FRAME_W - (dist - FRAME_W - FRAME_H), y: FRAME_Y + FRAME_H };
  return { x: FRAME_X, y: FRAME_Y + FRAME_H - (dist - 2 * FRAME_W - FRAME_H) };
}

export const SAND_DOTS = [
  { cx: 91, cy: 172 },
  { cx: 109, cy: 172 },
  { cx: 100, cy: 158 },
  { cx: 100, cy: 84 },
] as const;
