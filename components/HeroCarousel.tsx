'use client';

import { useState } from "react";
import Image from "next/image";
import { Text } from "./ui/Text";
import m1 from '@/assets/m1.png'
import m3 from '@/assets/m3.png'

const systems = [
  { id: 2, title: "Our Official Website", img: m3 },
  { id: 1, title: "Election Management System", img: m1 },
  { id: 3, title: "Our Official Website", img: m3 },
];

export function HeroCarousel() {
  const mid = (systems.length - 1) / 2;
  const [activeIndex, setActiveIndex] = useState(0);

  const handleClick = () => {
    setActiveIndex((prev) => (prev + 1) % systems.length);
  };

  return (
    <div className="relative w-[420px] h-[280px]">
      {systems.map((system, i) => {
        const offset = (i - mid) * 20;
        const rotate = (i - mid) * 3;
        const isActive = i === activeIndex;

        const baseTransform = `translate(${offset}px, ${Math.abs(offset) * 0.5}px) rotate(${rotate}deg)`;
        const activeTransform = "translate(0px, -14px) rotate(0deg) scale(1.05)";

        return (
          <div
            key={system.id}
            onClick={handleClick}
            className="group absolute inset-0 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-lg overflow-hidden transition-transform duration-500 ease-out cursor-pointer"
            style={{
              transform: isActive ? activeTransform : baseTransform,
              transformOrigin: "center",
              zIndex: isActive ? 50 : systems.length - Math.abs(i - mid),
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