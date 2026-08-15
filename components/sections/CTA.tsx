import Link from "next/link";
import { Button } from "../retro/button";
import { Reveal } from "../Reveal";
import { Text } from "../ui/Text";
import { ArrowRight } from "lucide-react";

export function CTA() {
    return (
        <section className="relative bg-brand py-20 overflow-hidden">

            {/* Decorative Outer Rings - Top Left */}
            <div className="absolute -top-24 -left-24 w-96 h-96 border-[55px] border-white/10 rounded-full pointer-events-none" />
            <div className="absolute -top-10 -left-10 w-60 h-60 border-[10px] border-white/10 rounded-full pointer-events-none" />

            {/* Decorative Outer Rings - Bottom Right */}
            <div className="absolute -bottom-28 -right-14 w-52 h-52 border-[28px] border-black/10 rounded-full pointer-events-none" />
            <div className="absolute -bottom-16 right-10 w-32 h-32 border-[6px] border-black/10 rounded-full pointer-events-none" />

            {/* Dashed Arc */}
            <svg className="absolute left-0 top-1/3 w-32 h-64 pointer-events-none opacity-40 -scale-x-100" viewBox="0 0 128 256" fill="none">
                <path d="M 128 8 A 120 120 0 0 1 128 248" className="stroke-white" strokeWidth="1.5" strokeDasharray="6 6" />
            </svg>

            {/* Dot Pattern - Top Right */}
            <div
                className="absolute top-8 right-6 w-44 h-36 pointer-events-none opacity-[0.18] rounded text-white"
                style={{
                    backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                    backgroundSize: '12px 12px'
                }}
            />

            {/* Dot Pattern - Bottom Left */}
            <div
                className="absolute bottom-8 left-6 w-52 h-40 pointer-events-none opacity-[0.18] rounded text-black"
                style={{
                    backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                    backgroundSize: '12px 12px'
                }}
            />

            {/* Repeating Linear Gradient - Top Left */}
            <div
                className="absolute top-0 left-0 w-40 h-28 pointer-events-none opacity-[0.10] text-black"
                style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)',
                    backgroundSize: '8px 8px'
                }}
            />

            {/* Repeating Linear Gradient - Bottom Right */}
            <div
                className="absolute bottom-0 right-0 w-40 h-28 pointer-events-none opacity-[0.10] text-white"
                style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)',
                    backgroundSize: '8px 8px'
                }}
            />

            {/* Diagonal Line Accents - Top Left */}
            <svg className="absolute top-0 left-0 w-24 h-24 pointer-events-none" viewBox="0 0 96 96" fill="none">
                <line x1="0" y1="0" x2="60" y2="60" className="stroke-white" strokeWidth="1" opacity="0.25" />
                <line x1="0" y1="20" x2="40" y2="60" className="stroke-white" strokeWidth="1" opacity="0.18" />
                <line x1="20" y1="0" x2="80" y2="60" className="stroke-white" strokeWidth="1" opacity="0.12" />
            </svg>

            {/* Diagonal Line Accents - Bottom Right */}
            <svg className="absolute bottom-0 right-0 w-24 h-24 pointer-events-none" viewBox="0 0 96 96" fill="none">
                <line x1="96" y1="96" x2="36" y2="36" className="stroke-black" strokeWidth="1" opacity="0.2" />
                <line x1="96" y1="76" x2="56" y2="36" className="stroke-black" strokeWidth="1" opacity="0.15" />
                <line x1="76" y1="96" x2="16" y2="36" className="stroke-black" strokeWidth="1" opacity="0.1" />
            </svg>

            {/* Side Border Bar - Left */}
            <div className="absolute left-0 top-1/4 pointer-events-none flex">
                <div className="w-[5px] h-24 bg-white rounded-r" />
                <div className="w-[3px] h-24 bg-black/10" />
            </div>

            {/* Side Border Bar - Right */}
            <div className="absolute right-0 bottom-1/4 pointer-events-none flex">
                <div className="w-[3px] h-24 bg-black/10" />
                <div className="w-[5px] h-24 bg-white rounded-l" />
            </div>

            {/* Horizontal Line Accents */}
            <div className="absolute left-10 bottom-[20%] pointer-events-none flex flex-col gap-1.5">
                <div className="w-24 h-px bg-white/50" />
                <div className="w-16 h-px bg-white/25" />
            </div>
            <div className="absolute right-10 top-[20%] pointer-events-none flex flex-col gap-1.5 items-end">
                <div className="w-24 h-px bg-black/25" />
                <div className="w-16 h-px bg-black/15" />
            </div>

            {/* Diamond Accents */}
            <svg className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none opacity-60" width="20" height="20" viewBox="0 0 20 20">
                <polygon points="10,1 19,10 10,19 1,10" fill="none" className="stroke-white" strokeWidth="1.5" />
                <polygon points="10,5 15,10 10,15 5,10" className="fill-white" opacity="0.4" />
            </svg>
            <svg className="absolute left-10 bottom-1/2 translate-y-1/2 pointer-events-none opacity-40" width="16" height="16" viewBox="0 0 16 16">
                <polygon points="8,1 15,8 8,15 1,8" fill="none" className="stroke-white" strokeWidth="1.2" />
            </svg>
            <svg className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" width="16" height="16" viewBox="0 0 16 16">
                <polygon points="8,1 15,8 8,15 1,8" fill="none" className="stroke-black" strokeWidth="1.2" />
            </svg>

            <Reveal className="relative z-10 mx-6 md:mx-24 flex flex-col md:flex-row items-center justify-between gap-8">
                <Text className="font-head text-3xl md:text-5xl text-white leading-tight uppercase max-w-2xl text-center md:text-left">
                    Your Business Deserves Better Software.
                </Text>
                <Link href="#contact" className="shrink-0">
                    <Button className="px-8 py-3 bg-white text-brand font-head tracking-widest hover:bg-black hover:text-white transition-colors">
                        LET'S MAKE ONE <ArrowRight className="h-4 w-4 ml-2 inline" />
                    </Button>
                </Link>
            </Reveal>
        </section>
    )
}