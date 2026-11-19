/**
 * Minimal rigid-body sim for the throwable headline.
 *
 * Semi-implicit Euler integration with axis-aligned box bodies, wall
 * bounce, and impulse-based separation for body-on-body collisions.
 * Bodies are rectangles that also rotate — rotation is decorative
 * (driven by horizontal velocity) rather than a true angular DOF,
 * because full 2D rotational collision response is far more machinery
 * than a headline needs and reads no better.
 */

export interface Body {
  id: string;
  char: string;
  /** Rest position, in container pixels. The body springs back to this. */
  homeX: number;
  homeY: number;
  w: number;
  h: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  /** Heavier characters resist throws more. Scaled by glyph area. */
  mass: number;
  held: boolean;
}

export interface WorldConfig {
  gravity: number;
  /** Per-second velocity retention. 0.06 ≈ heavy air. */
  friction: number;
  /** Energy kept after a wall hit. */
  restitution: number;
  /** Spring pulling bodies home when the world is at rest. */
  homing: number;
  homingDamping: number;
}

export const DEFAULT_WORLD: WorldConfig = {
  gravity: 2100,
  friction: 0.06,
  restitution: 0.52,
  homing: 34,
  homingDamping: 7,
};

export function stepWorld(
  bodies: Body[],
  bounds: { w: number; h: number },
  dt: number,
  cfg: WorldConfig,
  /** When true, bodies are pulled back to their home positions. */
  homing: boolean,
): void {
  const d = Math.min(dt, 1 / 30);

  for (const b of bodies) {
    if (b.held) continue;

    if (homing) {
      // Critically damped return to layout position.
      const ax = -cfg.homing * (b.x - b.homeX) - cfg.homingDamping * b.vx;
      const ay = -cfg.homing * (b.y - b.homeY) - cfg.homingDamping * b.vy;
      b.vx += ax * d * 60 * d;
      b.vy += ay * d * 60 * d;
      b.x += b.vx * d;
      b.y += b.vy * d;
      b.rot += (0 - b.rot) * Math.min(1, d * 8);

      if (
        Math.abs(b.x - b.homeX) < 0.4 && Math.abs(b.y - b.homeY) < 0.4 &&
        Math.abs(b.vx) < 2 && Math.abs(b.vy) < 2
      ) {
        b.x = b.homeX; b.y = b.homeY; b.vx = 0; b.vy = 0; b.rot = 0;
      }
      continue;
    }

    b.vy += cfg.gravity * d;
    b.vx *= 1 - cfg.friction * d * 12;
    b.vy *= 1 - cfg.friction * d * 4;

    b.x += b.vx * d;
    b.y += b.vy * d;

    // Rotation follows horizontal travel, like a tumbling card.
    b.rot += b.vx * d * 0.22;

    // Walls
    if (b.x < 0) { b.x = 0; b.vx = -b.vx * cfg.restitution; }
    if (b.x + b.w > bounds.w) { b.x = bounds.w - b.w; b.vx = -b.vx * cfg.restitution; }
    if (b.y < 0) { b.y = 0; b.vy = -b.vy * cfg.restitution; }
    if (b.y + b.h > bounds.h) {
      b.y = bounds.h - b.h;
      b.vy = -b.vy * cfg.restitution;
      b.vx *= 0.9;                       // ground drag
      if (Math.abs(b.vy) < 40) b.vy = 0; // settle
    }
  }

  if (!homing) resolveCollisions(bodies, cfg.restitution);
}

/** Impulse-based separation along the axis of least penetration. */
function resolveCollisions(bodies: Body[], restitution: number): void {
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i];
      const b = bodies[j];

      const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
      const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      if (ox <= 0 || oy <= 0) continue;

      const totalMass = a.mass + b.mass;
      const aShare = a.held ? 0 : b.held ? 1 : b.mass / totalMass;
      const bShare = b.held ? 0 : a.held ? 1 : a.mass / totalMass;

      if (ox < oy) {
        const dir = a.x + a.w / 2 < b.x + b.w / 2 ? -1 : 1;
        a.x += ox * aShare * dir;
        b.x -= ox * bShare * dir;
        const rel = a.vx - b.vx;
        if (!a.held) a.vx -= rel * 0.5 * restitution;
        if (!b.held) b.vx += rel * 0.5 * restitution;
      } else {
        const dir = a.y + a.h / 2 < b.y + b.h / 2 ? -1 : 1;
        a.y += oy * aShare * dir;
        b.y -= oy * bShare * dir;
        const rel = a.vy - b.vy;
        if (!a.held) a.vy -= rel * 0.5 * restitution;
        if (!b.held) b.vy += rel * 0.5 * restitution;
      }
    }
  }
}

/** True when every body has effectively stopped. */
export function isAsleep(bodies: Body[]): boolean {
  return bodies.every((b) => !b.held && Math.abs(b.vx) < 3 && Math.abs(b.vy) < 3);
}
