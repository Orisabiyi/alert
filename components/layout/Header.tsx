import Image from "next/image";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function Header() {
  return (
    <header className="flex items-center justify-between border-b-[3px] border-black bg-white px-4 py-3 sm:px-8 lg:px-10">
      <div className="flex items-center gap-3">
        <Image src="/brand/mark.svg" alt="Alert" width={34} height={34} priority />
        <span className="font-fat text-[1.4rem] tracking-[-0.04em]">ALERT</span>
      </div>
      <div className="flex items-center gap-5">
        <span className="hidden font-mono text-[0.66rem] font-bold tracking-[0.1em] md:inline">
          SETTLEMENT INFRASTRUCTURE / LAGOS
        </span>
        <MagneticButton variant="black">TALK TO SALES</MagneticButton>
      </div>
    </header>
  );
}
