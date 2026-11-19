"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface SpringOptions {
  stiffness?: number;
  damping?: number;
  mass?: number;
  precision?: number;
}

/**
 * Damped spring integrated per frame. Every non-physics motion on the
 * site runs through this, so the whole interface obeys one set of laws.
 */
export function useSpring(target: number, opts: SpringOptions = {}) {
  const { stiffness = 180, damping = 22, mass = 1, precision = 0.01 } = opts;
  const [value, setValue] = useState(target);
  const state = useRef({ x: target, v: 0, target });
  const raf = useRef(0);

  useEffect(() => { state.current.target = target; }, [target]);

  useEffect(() => {
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      const s = state.current;
      s.v += ((-stiffness * (s.x - s.target) - damping * s.v) / mass) * dt;
      s.x += s.v * dt;
      if (Math.abs(s.x - s.target) < precision && Math.abs(s.v) < precision) {
        s.x = s.target; s.v = 0;
      }
      setValue(s.x);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [stiffness, damping, mass, precision]);

  const impulse = useCallback((v: number) => { state.current.v += v; }, []);
  const set = useCallback((x: number) => { state.current.x = x; state.current.v = 0; }, []);

  return [value, { impulse, set, state }] as const;
}
