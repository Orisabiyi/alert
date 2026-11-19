import Image from "next/image";

const ICONS = {
  "arrow-right": "/icons/arrow-right.svg",
  bolt: "/icons/bolt.svg",
  bank: "/icons/bank.svg",
  card: "/icons/card.svg",
  clock: "/icons/clock.svg",
  phone: "/icons/phone.svg",
} as const;

export type IconName = keyof typeof ICONS;

/** All iconography is served from real .svg files in /public/icons. */
export function Icon({ name, size = 24, alt = "" }: { name: IconName; size?: number; alt?: string }) {
  return (
    <Image
      src={ICONS[name]}
      alt={alt}
      width={size}
      height={size}
      aria-hidden={alt === ""}
      className="block shrink-0"
    />
  );
}
