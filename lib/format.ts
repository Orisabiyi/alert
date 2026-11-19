export const naira = (n: number): string =>
  Math.round(n).toLocaleString("en-NG");

export const clamp = (n: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, n));
