"use client";

import { useRef, useState } from "react";
import { useSpring } from "@/hooks/useSpring";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type Variant = "lime" | "white" | "black";

const VARIANTS: Record<Variant, string> = {
  lime: "bg-lime shadow-[6px_6px_0_#0A0A0A]",
  white: "bg-white shadow-[6px_6px_0_#0A0A0A]",
  black: "bg-black text-paper shadow-[4px_4px_0_#FF4B26]",
};

/**
 * Button that leans toward the cursor. The inner label trails at 30% of
 * the outer offset — that small parallax is what makes it read as a
 * physical object rather than a sticky div.
 */
export function MagneticButton({
  children,
  variant = "lime",
  className = "",
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [t, setT] = useState({ x: 0, y: 0 });
  const [x] = useSpring(t.x, { stiffness: 200, damping: 16 });
  const [y] = useSpring(t.y, { stiffness: 200, damping: 16 });
  const reduced = usePrefersReducedMotion();

  return (
    <button
      ref={ref}
      type="button"
      onPointerMove={(e) => {
        if (reduced) return;
        const r = ref.current!.getBoundingClientRect();
        setT({
          x: (e.clientX - (r.left + r.width / 2)) * 0.3,
          y: (e.clientY - (r.top + r.height / 2)) * 0.35,
        });
      }}
      onPointerLeave={() => setT({ x: 0, y: 0 })}
      style={reduced ? undefined : { transform: `translate(${x}px, ${y}px)` }}
      className={`border-[3px] border-black px-6 py-3.5 font-mono text-[0.78rem] font-bold tracking-[0.06em]
        transition-shadow will-change-transform active:shadow-[2px_2px_0_#0A0A0A]
        ${VARIANTS[variant]} ${className}`}
    >
      <span
        className="flex items-center gap-2"
        style={reduced ? undefined : { transform: `translate(${x * 0.3}px, ${y * 0.3}px)` }}
      >
        {children}
      </span>
    </button>
  );
}
