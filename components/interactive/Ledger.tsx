"use client";

import { useRef, useState } from "react";
import { useSpring } from "@/hooks/useSpring";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { naira } from "@/lib/format";

export interface Entry {
  id: string;
  amount: number;
  at: string;
}

/** Tilts toward the cursor in 3D. Springs on both axes, so it settles. */
export function Ledger({ entries, total }: { entries: Entry[]; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ rx: 0, ry: 0 });
  const [rx] = useSpring(t.rx, { stiffness: 140, damping: 18 });
  const [ry] = useSpring(t.ry, { stiffness: 140, damping: 18 });
  const [st] = useSpring(total, { stiffness: 90, damping: 20 });
  const reduced = usePrefersReducedMotion();

  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        if (reduced) return;
        const r = ref.current!.getBoundingClientRect();
        setT({
          rx: (0.5 - (e.clientY - r.top) / r.height) * 10,
          ry: ((e.clientX - r.left) / r.width - 0.5) * 12,
        });
      }}
      onPointerLeave={() => setT({ rx: 0, ry: 0 })}
      style={reduced ? undefined : { transform: `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)` }}
      className="border-[3px] border-black bg-white shadow-[10px_10px_0_#0A0A0A] will-change-transform"
    >
      <div className="flex items-center justify-between bg-black px-3.5 py-2.5">
        <span className="font-mono text-[0.62rem] font-bold tracking-[0.12em] text-paper">
          SETTLED THIS SESSION
        </span>
        <b className="font-mono text-[1.15rem] tabular-nums text-lime">₦{naira(st)}</b>
      </div>

      <div className="grid min-h-[11rem] content-start gap-2 p-3.5">
        {entries.length === 0 && (
          <p className="p-6 text-center font-mono text-[0.72rem] font-bold leading-loose tracking-[0.06em] opacity-40">
            NOTHING YET.
            <br />
            THROW ONE ACROSS →
          </p>
        )}
        {entries.map((e) => (
          <div
            key={e.id}
            className="flex animate-row-in items-center justify-between border-[3px] border-black bg-lime px-2.5 py-2.5 font-mono text-[0.9rem] font-bold shadow-[3px_3px_0_#0A0A0A]"
          >
            <span className="tabular-nums">₦{naira(e.amount)}</span>
            <span className="text-[0.65rem] font-medium">{e.at}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
