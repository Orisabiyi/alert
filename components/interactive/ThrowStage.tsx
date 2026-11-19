"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSpring } from "@/hooks/useSpring";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { clamp, naira } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";

/**
 * Drag a payment across the settlement gap and fling it into the
 * account. Release is judged on displacement OR velocity, so a fast
 * flick lands even from a short drag — the same rule native gesture
 * handlers use, and the reason it feels right rather than fussy.
 */
export function ThrowStage({ onSettle }: { onSettle: (amount: number) => void }) {
  const track = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [flying, setFlying] = useState(false);
  const [settled, setSettled] = useState(false);
  const [amount, setAmount] = useState(12500);
  const vel = useRef({ x: 0, t: 0, last: 0 });
  const reduced = usePrefersReducedMotion();

  const [sx, ctlX] = useSpring(0, { stiffness: 220, damping: 26 });
  const [sy, ctlY] = useSpring(0, { stiffness: 220, damping: 26 });

  const reset = useCallback(() => {
    setSettled(false);
    setFlying(false);
    ctlX.set(0); ctlY.set(0);
    setPos({ x: 0, y: 0 });
    setAmount(Math.round(1500 + Math.random() * 90000));
  }, [ctlX, ctlY]);

  const settle = useCallback(() => {
    setSettled(true);
    onSettle(amount);
    window.setTimeout(reset, 1800);
  }, [amount, onSettle, reset]);

  const down = (e: React.PointerEvent) => {
    if (flying || reduced) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ x: e.clientX - pos.x, y: e.clientY - pos.y });
    vel.current = { x: 0, t: performance.now(), last: e.clientX };
  };

  const move = (e: React.PointerEvent) => {
    if (!drag) return;
    const now = performance.now();
    const dt = now - vel.current.t;
    if (dt > 0) {
      vel.current.x = ((e.clientX - vel.current.last) / dt) * 1000;
      vel.current.t = now;
      vel.current.last = e.clientX;
    }
    const nx = e.clientX - drag.x;
    const ny = clamp(e.clientY - drag.y, -60, 60);
    setPos({ x: nx, y: ny });
    ctlX.set(nx); ctlY.set(ny);
  };

  const up = () => {
    if (!drag) return;
    const w = track.current?.offsetWidth ?? 600;
    const v = vel.current.x;
    setDrag(null);

    if (pos.x > w * 0.4 || v > 900) {
      setFlying(true);
      ctlX.impulse(Math.max(v, 1500));
      window.setTimeout(settle, 240);
    } else {
      setPos({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    if (!drag && !flying) {
      ctlX.state.current.target = 0;
      ctlY.state.current.target = 0;
    }
  }, [drag, flying, pos, ctlX, ctlY]);

  const w = track.current?.offsetWidth ?? 600;
  const progress = clamp(sx / (w * 0.4), 0, 1);

  return (
    <div>
      <div className="mb-3 flex justify-between">
        <span className="flex items-center gap-2 border-[3px] border-black bg-cobalt px-2.5 py-1.5 font-mono text-[0.62rem] font-bold tracking-[0.12em] text-white shadow-[3px_3px_0_#0A0A0A]">
          <Icon name="card" size={14} /> 01 / TAKEN
        </span>
        <span className="flex items-center gap-2 border-[3px] border-black bg-lime px-2.5 py-1.5 font-mono text-[0.62rem] font-bold tracking-[0.12em] shadow-[3px_3px_0_#0A0A0A]">
          <Icon name="bank" size={14} /> 02 / YOURS
        </span>
      </div>

      <div
        ref={track}
        className="relative flex h-[190px] touch-none items-center overflow-hidden border-[3px] border-black bg-white px-4 shadow-[6px_6px_0_#0A0A0A]"
      >
        <div
          className="absolute inset-0 origin-left bg-lime will-change-transform"
          style={{ transform: `scaleX(${progress})` }}
        />

        <div
          className={`absolute right-4 grid h-24 w-[120px] place-items-center border-[3px] border-black transition-colors ${
            settled ? "bg-lime" : "bg-paper"
          }`}
        >
          <span className="font-mono text-[0.68rem] font-bold tracking-[0.12em]">
            {settled ? "IN" : "OPEN"}
          </span>
        </div>

        {!settled && (
          <div
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            className={`relative z-10 grid w-[200px] cursor-grab touch-none gap-1 border-[3px] border-black bg-white p-3.5 will-change-transform active:cursor-grabbing ${
              drag ? "shadow-[10px_10px_0_#0A0A0A]" : "shadow-[6px_6px_0_#0A0A0A]"
            }`}
            style={{
              transform: `translate(${sx}px, ${sy}px) rotate(${clamp(-3 + sy * 0.2, -14, 14)}deg)`,
              opacity: flying ? Math.max(0, 1 - progress) : 1,
            }}
          >
            <span className="justify-self-start bg-vermillion px-1.5 py-0.5 font-mono text-[0.58rem] font-bold tracking-[0.14em] text-white">
              CREDIT ALERT
            </span>
            <span className="font-fat text-[1.4rem] tabular-nums tracking-[-0.03em]">
              ₦{naira(amount)}
            </span>
            <span className="font-mono text-[0.6rem] tracking-[0.06em]">MAMA NGOZI FABRICS</span>
          </div>
        )}

        {settled && (
          <div className="absolute right-4 w-[120px] text-center font-mono text-[0.72rem] font-bold leading-relaxed">
            ₦{naira(amount)}
            <br />
            <b className="font-fat text-[0.78rem] tracking-[0.04em]">SETTLED</b>
          </div>
        )}
      </div>

      <p className="mt-4 font-mono text-[0.72rem] font-bold tracking-[0.12em]">
        {drag ? "▸ LET GO" : settled ? "▸ THAT'S THE PRODUCT" : "▸ DRAG IT ACROSS"}
      </p>
    </div>
  );
}
