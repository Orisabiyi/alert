export function Stat({ value, label, tilt = 0 }: { value: string; label: string; tilt?: number }) {
  return (
    <div
      style={{ transform: `rotate(${tilt}deg)` }}
      className="group border-[3px] border-black bg-white p-4 shadow-[6px_6px_0_#0A0A0A] transition-all duration-200 hover:!rotate-0 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[9px_9px_0_#0A0A0A]"
    >
      <b className="block font-fat text-[1.9rem] leading-none tracking-[-0.035em]">{value}</b>
      <span className="mt-1.5 block font-mono text-[0.6rem] font-bold tracking-[0.1em]">{label}</span>
    </div>
  );
}
