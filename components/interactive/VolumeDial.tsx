"use client";

import { useCallback, useRef, useState } from "react";
import { useSpring } from "@/hooks/useSpring";
import { clamp, naira } from "@/lib/format";

const MIN = 100_000;
const MAX = 50_000_000;

/**
 * Drag to set monthly volume; the outputs recompute live. Fully
 * keyboard-operable with a real slider role — most portfolio drag
 * components quietly aren't.
 */
export function VolumeDial() {
  const [vol, setVol] = useState(4_000_000);
  const bar = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const pct = (vol - MIN) / (MAX - MIN);
  const [sp] = useSpring(pct, { stiffness: 260, damping: 30 });

  const fromPointer = useCallback((cx: number) => {
    const r = bar.current!.getBoundingClientRect();
    setVol(Math.round(MIN + clamp((cx - r.left) / r.width, 0, 1) * (MAX - MIN)));
  }, []);

  return (
    <div className="border-[3px] border-black bg-white p-6 shadow-[10px_10px_0_#0A0A0A]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <span className="border-[3px] border-black bg-cobalt px-2.5 py-1.5 font-mono text-[0.62rem] font-bold tracking-[0.12em] text-white shadow-[3px_3px_0_#0A0A0A]">
          MONTHLY VOLUME
        </span>
        <span className="font-fat text-[clamp(1.4rem,1rem+2vw,2.2rem)] tabular-nums tracking-[-0.035em]">
          ₦{naira(vol)}
        </span>
      </div>

      <div
        ref={bar}
        role="slider"
        tabIndex={0}
        aria-valuenow={vol}
        aria-valuemin={MIN}
        aria-valuemax={MAX}
        aria-label="Monthly transaction volume"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
          fromPointer(e.clientX);
        }}
        onPointerMove={(e) => dragging && fromPointer(e.clientX)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setVol((v) => Math.min(MAX, v + 500_000));
          if (e.key === "ArrowLeft") setVol((v) => Math.max(MIN, v - 500_000));
        }}
        className={`relative h-14 cursor-ew-resize touch-none overflow-hidden border-[3px] border-black ${
          dragging ? "bg-white" : "bg-paper"
        }`}
      >
        <div
          className="absolute inset-0 origin-left bg-cobalt will-change-transform"
          style={{ transform: `scaleX(${sp})` }}
        />
        <div
          className="absolute -top-1 -bottom-1 w-4 -translate-x-2 border-[3px] border-black bg-vermillion will-change-[left]"
          style={{ left: `${sp * 100}%` }}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="border-[3px] border-black bg-lime p-4 shadow-[6px_6px_0_#0A0A0A]">
          <b className="block font-fat text-[clamp(1.3rem,1rem+1.6vw,1.9rem)] tabular-nums tracking-[-0.035em]">
            ₦{naira(vol / 30)}
          </b>
          <span className="mt-1.5 block font-mono text-[0.6rem] font-bold tracking-[0.1em]">
            WORKING CAPITAL RELEASED
          </span>
        </div>
        <div className="border-[3px] border-black bg-white p-4 shadow-[6px_6px_0_#0A0A0A]">
          <b className="block font-fat text-[clamp(1.3rem,1rem+1.6vw,1.9rem)] tabular-nums tracking-[-0.035em]">
            ₦{naira(vol * 0.014)}
          </b>
          <span className="mt-1.5 block font-mono text-[0.6rem] font-bold tracking-[0.1em]">
            IN FEES · FLAT 1.4%
          </span>
        </div>
      </div>
    </div>
  );
}
