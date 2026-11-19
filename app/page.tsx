"use client";

import { useCallback, useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThrowableHeadline } from "@/components/hero/ThrowableHeadline";
import { ThrowStage } from "@/components/interactive/ThrowStage";
import { VolumeDial } from "@/components/interactive/VolumeDial";
import { Ledger, type Entry } from "@/components/interactive/Ledger";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Marquee } from "@/components/ui/Marquee";
import { Stat } from "@/components/ui/Stat";
import { Icon } from "@/components/ui/Icon";

const STATS = [
  { value: "1.4s", label: "MEDIAN SETTLEMENT", tilt: -0.7 },
  { value: "₦48B", label: "SETTLED MONTHLY", tilt: 0.7 },
  { value: "99.98%", label: "UPTIME", tilt: -0.7 },
  { value: "18,400", label: "MERCHANTS", tilt: 0.7 },
];

const FEATURES = [
  { icon: "bolt", title: "INSTANT PAYOUT", body: "Funds hit your account seconds after the transaction clears. Seven days a week, public holidays included." },
  { icon: "card", title: "ONE ALERT, EVERY CHANNEL", body: "Card, transfer, USSD and POS all resolve to the same notification, so your books reconcile themselves." },
  { icon: "phone", title: "WORKS ON 3G", body: "The merchant app is 180kb and stays usable on a mid-range Android with two bars of signal." },
] as const;

export default function Page() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const total = useMemo(() => entries.reduce((s, e) => s + e.amount, 0), [entries]);

  const onSettle = useCallback((amount: number) => {
    setEntries((prev) =>
      [
        {
          id: Math.random().toString(36).slice(2),
          amount,
          at: new Date().toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        },
        ...prev,
      ].slice(0, 5),
    );
  }, []);

  return (
    <div className="relative z-[1]">
      <Header />

      <Marquee
        className="bg-cobalt text-white"
        items={['NO T+1', 'NO CUT-OFF TIMES', 'NO "CHECK BACK AFTER 9AM"']}
      />

      <main className="mx-auto max-w-[1140px] px-4 sm:px-8 lg:px-10">
        {/* --- hero --- */}
        <section className="grid gap-10 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 lg:py-16">
          <div>
            <span className="mb-6 inline-block -rotate-2 border-[3px] border-black bg-vermillion px-3 py-1.5 font-mono text-[0.66rem] font-bold tracking-[0.14em] text-white shadow-[4px_4px_0_#0A0A0A]">
              EST. 2026
            </span>

            <ThrowableHeadline />

            <p className="mt-8 max-w-[34ch] text-[1.02rem] font-medium leading-relaxed">
              Your customer taps. The money is yours while they&rsquo;re still packing
              their bag. Not tomorrow. Not after the settlement window.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <MagneticButton variant="lime">
                START SETTLING <Icon name="arrow-right" size={16} />
              </MagneticButton>
              <MagneticButton variant="white">READ THE DOCS</MagneticButton>
            </div>
          </div>

          <div className="lg:pt-24">
            <Ledger entries={entries} total={total} />
          </div>
        </section>

        {/* --- stats --- */}
        <section className="grid grid-cols-2 gap-4 pb-14 lg:grid-cols-4">
          {STATS.map((s) => (
            <Stat key={s.label} {...s} />
          ))}
        </section>

        {/* --- throw --- */}
        <section className="border-t-[3px] border-black py-12 lg:py-16">
          <h2 className="m-0 mb-9 font-fat text-[clamp(2rem,1rem+4vw,3.6rem)] leading-[0.92] tracking-[-0.04em]">
            SETTLEMENT,
            <br />
            AS A{" "}
            <span className="inline-block rotate-1 border-[3px] border-black bg-cobalt px-2 text-white shadow-[5px_5px_0_#0A0A0A]">
              PHYSICAL ACT.
            </span>
          </h2>
          <ThrowStage onSettle={onSettle} />
        </section>

        {/* --- features --- */}
        <section className="border-t-[3px] border-black py-12 lg:py-16">
          <h2 className="m-0 mb-9 font-fat text-[clamp(2rem,1rem+4vw,3.6rem)] leading-[0.92] tracking-[-0.04em]">
            BUILT FOR HOW
            <br />
            MERCHANTS{" "}
            <span className="inline-block -rotate-1 border-[3px] border-black bg-lime px-2 shadow-[5px_5px_0_#0A0A0A]">
              ACTUALLY TRADE.
            </span>
          </h2>

          <div className="grid gap-5 md:grid-cols-3">
            {FEATURES.map((f, i) => (
              <article
                key={f.title}
                className={`border-[3px] border-black p-6 shadow-[6px_6px_0_#0A0A0A] ${
                  i === 1 ? "bg-hatch bg-white" : "bg-white"
                }`}
              >
                <span className="mb-5 inline-flex border-[3px] border-black bg-paper p-2.5">
                  <Icon name={f.icon} size={22} />
                </span>
                <h3 className="m-0 mb-2.5 font-fat text-[1.05rem] tracking-[-0.02em]">{f.title}</h3>
                <p className="m-0 text-[0.92rem] font-medium leading-relaxed">{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* --- dial --- */}
        <section className="border-t-[3px] border-black py-12 lg:py-16">
          <h2 className="m-0 mb-9 font-fat text-[clamp(2rem,1rem+4vw,3.6rem)] leading-[0.92] tracking-[-0.04em]">
            DRAG YOUR
            <br />
            <span className="inline-block -rotate-1 border-[3px] border-black bg-lime px-2 shadow-[5px_5px_0_#0A0A0A]">
              VOLUME.
            </span>
          </h2>
          <VolumeDial />
        </section>

        <Footer />
      </main>
    </div>
  );
}
