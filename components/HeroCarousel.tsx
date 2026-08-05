import Image from "next/image";
import { Text } from "./ui/Text";
import m1 from '@/assets/m1.png'

const systems = [
  { id: 1, title: "Election Management System", img: m1 },
  { id: 2, title: "Booking Platform", img: m1 },
  { id: 3, title: "Analytics Dashboard", img: m1 },
];

export function HeroCarousel() {
  const mid = (systems.length - 1) / 2;

  return (
    <div className="relative w-[420px] h-[280px]">
      {systems.map((system, i) => {
        const offset = (i - mid) * 20;
        const rotate = (i - mid) * 3;

        return (
          <div
            key={system.id}
            className="group absolute inset-0 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-lg overflow-hidden transition-transform duration-500 ease-out cursor-pointer"
            style={{
              transform: `translate(${offset}px, ${Math.abs(offset) * 0.5}px) rotate(${rotate}deg)`,
              transformOrigin: "center",
              zIndex: systems.length - Math.abs(i - mid),
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translate(0px, -14px) rotate(0deg) scale(1.05)";
              e.currentTarget.style.zIndex = "50";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = `translate(${offset}px, ${Math.abs(offset) * 0.5}px) rotate(${rotate}deg)`;
              e.currentTarget.style.zIndex = String(systems.length - Math.abs(i - mid));
            }}
          >
            <div className="relative w-full aspect-[16/9]">
              <Image src={system.img} alt={system.title} fill className="object-fit" />
            </div>
            <div className="p-4">
              <Text className="font-head text-sm md:text-base">{system.title}</Text>
            </div>
          </div>
        );
      })}
    </div>
  );
}