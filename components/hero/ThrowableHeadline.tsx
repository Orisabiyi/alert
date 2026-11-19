"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { type Body, DEFAULT_WORLD, isAsleep, stepWorld } from "@/lib/physics";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const LINES = ["MONEY", "THAT LANDS", "BEFORE", "THEY LEAVE"] as const;
const ACCENT_LINE = 2;
const ACCENT_CLS = "border-[3px] border-black bg-lime px-1 shadow-[5px_5px_0_#0A0A0A]";

/**
 * The headline is a physics world. Each character is a rigid body that
 * can be grabbed, thrown, and collided with the others. Let go and the
 * letters fall; press PUT IT BACK and they spring into typographic
 * position.
 *
 * Resting positions are measured from a real layout pass rather than
 * hardcoded, so the headline reflows correctly at any viewport width.
 */
export function ThrowableHeadline({ className = "" }: { className?: string }) {
  const stage = useRef<HTMLDivElement>(null);
  const measure = useRef<HTMLDivElement>(null);
  const bodies = useRef<Body[]>([]);
  const nodes = useRef<Map<string, HTMLSpanElement>>(new Map());
  const raf = useRef(0);
  const drag = useRef<{ id: string; dx: number; dy: number; lx: number; ly: number; t: number } | null>(null);

  const [ready, setReady] = useState(false);
  // Bumped on every measurement so rest positions are re-rendered.
  const [, setLayoutVersion] = useState(0);
  const [live, setLive] = useState(false);
  const [homing, setHoming] = useState(false);
  const reduced = usePrefersReducedMotion();

  const build = useCallback(() => {
    const host = measure.current;
    const box = stage.current;
    if (!host || !box) return;

    const origin = box.getBoundingClientRect();
    const next: Body[] = [];

    host.querySelectorAll<HTMLElement>("[data-char]").forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const x = r.left - origin.left;
      const y = r.top - origin.top;
      next.push({
        id: "c" + i,
        char: el.dataset.char ?? "",
        homeX: x, homeY: y,
        w: r.width, h: r.height,
        x, y, vx: 0, vy: 0, rot: 0,
        mass: Math.max(0.6, (r.width * r.height) / 3200),
        held: false,
      });
    });

    bodies.current = next;
    setReady(true);
    setLayoutVersion((v) => v + 1);
  }, []);

  useLayoutEffect(() => {
    build();
    const ro = new ResizeObserver(() => { if (!live) build(); });
    if (stage.current) ro.observe(stage.current);
    if (measure.current) ro.observe(measure.current);

    // Web fonts swap in after first paint; re-measure once they land so
    // glyph boxes match the real typeface rather than the fallback.
    let cancelled = false;
    const remeasure = () => { if (!cancelled && !live) build(); };
    document.fonts?.ready.then(remeasure);
    document.fonts?.addEventListener("loadingdone", remeasure);

    return () => {
      cancelled = true;
      ro.disconnect();
      document.fonts?.removeEventListener("loadingdone", remeasure);
    };
  }, [build, live]);

  useEffect(() => {
    if (!ready || reduced || (!live && !homing)) return;
    const box = stage.current;
    if (!box) return;

    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      stepWorld(bodies.current, { w: box.offsetWidth, h: box.offsetHeight }, dt, DEFAULT_WORLD, homing);

      for (const b of bodies.current) {
        const el = nodes.current.get(b.id);
        if (el) el.style.transform = "translate3d(" + b.x + "px," + b.y + "px,0) rotate(" + b.rot + "deg)";
      }

      if (homing && isAsleep(bodies.current) && bodies.current.every((b) => b.x === b.homeX && b.y === b.homeY)) {
        setHoming(false);
        setLive(false);
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [ready, live, homing, reduced]);

  const onDown = (id: string) => (e: React.PointerEvent<HTMLSpanElement>) => {
    if (reduced) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const b = bodies.current.find((x) => x.id === id);
    if (!b) return;

    setHoming(false);
    setLive(true);
    b.held = true;
    b.vx = 0; b.vy = 0;

    const r = stage.current!.getBoundingClientRect();
    drag.current = {
      id,
      dx: e.clientX - r.left - b.x,
      dy: e.clientY - r.top - b.y,
      lx: e.clientX, ly: e.clientY,
      t: performance.now(),
    };
  };

  const onMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    const d = drag.current;
    if (!d) return;
    const b = bodies.current.find((x) => x.id === d.id);
    if (!b) return;

    const r = stage.current!.getBoundingClientRect();
    b.x = e.clientX - r.left - d.dx;
    b.y = e.clientY - r.top - d.dy;

    const now = performance.now();
    const dt = now - d.t;
    if (dt > 0) {
      b.vx = ((e.clientX - d.lx) / dt) * 1000;
      b.vy = ((e.clientY - d.ly) / dt) * 1000;
      d.lx = e.clientX; d.ly = e.clientY; d.t = now;
    }
  };

  const onUp = () => {
    const d = drag.current;
    if (!d) return;
    const b = bodies.current.find((x) => x.id === d.id);
    if (b) b.held = false;
    drag.current = null;
  };

  const putBack = () => {
    drag.current = null;
    bodies.current.forEach((b) => { b.held = false; });
    setHoming(true);
    setLive(true);
  };

  const throwIt = () => {
    setHoming(false);
    setLive(true);
    bodies.current.forEach((b) => {
      b.vx = (Math.random() - 0.5) * 1600;
      b.vy = -Math.random() * 900 - 200;
    });
  };

  let index = 0;
  const typeCls = "font-fat text-[clamp(2.6rem,1rem+8.5vw,6.4rem)] leading-[0.86] tracking-[-0.045em]";

  return (
    <div className={className}>
      <div ref={stage} className="relative min-h-[clamp(260px,42vw,520px)] touch-none select-none">
        <div ref={measure} aria-hidden={ready} className={typeCls + (ready ? " invisible" : "")}>
          {LINES.map((line, li) => (
            <div key={li} className="whitespace-nowrap">
              {line.split("").map((ch, ci) => (
                <span
                  key={ci}
                  data-char={ch}
                  className={"inline-block" + (li === ACCENT_LINE && ch !== " " ? " " + ACCENT_CLS : "")}
                >
                  {ch === " " ? "\u00A0" : ch}
                </span>
              ))}
            </div>
          ))}
        </div>

        {ready && !reduced && (
          <h1 className="absolute inset-0 m-0">
            <span className="sr-only">Money that lands before they leave.</span>
            {LINES.map((line, li) =>
              line.split("").map((ch) => {
                const id = "c" + index++;
                if (ch === " ") return null;
                const accent = li === ACCENT_LINE;
                const b = bodies.current[index - 1];
                return (
                  <span
                    key={id}
                    ref={(el) => { if (el) nodes.current.set(id, el); }}
                    onPointerDown={onDown(id)}
                    onPointerMove={onMove}
                    onPointerUp={onUp}
                    onPointerCancel={onUp}
                    aria-hidden
                    style={b ? { transform: "translate3d(" + b.x + "px," + b.y + "px,0) rotate(" + b.rot + "deg)" } : undefined}
                    className={
                      "absolute left-0 top-0 inline-flex cursor-grab items-center justify-center will-change-transform active:cursor-grabbing " +
                      typeCls +
                      (accent ? " " + ACCENT_CLS : "")
                    }
                  >
                    {ch}
                  </span>
                );
              }),
            )}
          </h1>
        )}

        {reduced && (
          <h1 className={"m-0 " + typeCls}>
            {LINES.map((l, i) => (
              <span key={i} className="block">
                {i === ACCENT_LINE
                  ? <span className={ACCENT_CLS}>{l}</span>
                  : l}
              </span>
            ))}
          </h1>
        )}
      </div>

      {!reduced && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={throwIt}
            className="border-[3px] border-black bg-white px-4 py-2 font-mono text-[0.7rem] font-bold tracking-[0.1em] shadow-[4px_4px_0_#0A0A0A] transition-shadow active:shadow-[1px_1px_0_#0A0A0A]"
          >
            THROW IT
          </button>
          <button
            type="button"
            onClick={putBack}
            className="border-[3px] border-black bg-vermillion px-4 py-2 font-mono text-[0.7rem] font-bold tracking-[0.1em] text-white shadow-[4px_4px_0_#0A0A0A] transition-shadow active:shadow-[1px_1px_0_#0A0A0A]"
          >
            PUT IT BACK
          </button>
          <span className="font-mono text-[0.66rem] font-bold tracking-[0.1em] opacity-50">
            ▸ OR GRAB A LETTER
          </span>
        </div>
      )}
    </div>
  );
}
