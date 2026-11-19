/**
 * Infinite band. The list is duplicated so a -50% translate loops with
 * no visible seam. Decorative, so it is hidden from assistive tech and
 * stops completely under reduced-motion.
 */
export function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  const run = [...items, ...items];
  return (
    <div className={`overflow-hidden border-y-[3px] border-black ${className}`} aria-hidden>
      <div className="flex w-max animate-marquee whitespace-nowrap py-2.5 font-mono text-[0.75rem] font-bold tracking-[0.1em] motion-reduce:animate-none">
        {run.map((t, i) => (
          <span key={i} className="flex items-center">
            {t}
            <b className="px-4 text-lime">■</b>
          </span>
        ))}
      </div>
    </div>
  );
}
