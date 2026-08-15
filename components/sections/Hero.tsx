import Link from "next/link";
import { HeroBackground } from "../HeroBackground";
import { HeroCarousel } from "../HeroCarousel";
import { Button } from "../retro/button";
import { Text } from "../ui/Text";

const partners = [
    "SM Foundation",
    "EZVote EMS",
    "Meralco Foundation",
    "DICT Region III",
    "Partners are Dummy",
];

export function Hero() {
    return (
        <section id="home">
            <HeroBackground>
                <div className="min-h-[calc(100dvh+80px)] justify-center flex flex-col mx-6">
                    <div className=" flex flex-col md:flex-row justify-between items-center md:mx-24 gap-10 md:gap-4 mt-36 mb-24">
                        <div className="max-w-2xl text-left mt-16 md:mt-0 overflow-hidden">
                            <Text className="text-brand font-head text-5xl md:text-6xl leading-12 md:leading-16 animate-hero-in [animation-delay:0ms]">
                                <span className="text-black dark:text-white">
                                    LET<span className="text-brand">'</span>S TURN VISIBLE{" "}
                                </span>
                                PROBLEMS INTO{" "}
                                <span className="bg-brand text-white px-2">SYSTEMS</span>
                            </Text>
                            <Text className="text-neutral-600 dark:text-neutral-300 md:text-lg mt-4 animate-hero-in [animation-delay:120ms]">
                                We focused on creating practical digital solutions for
                                real-world problems. We aim to simplify everyday processes by
                                turning visible challenges into efficient, accessible, and
                                reliable systems through technology.
                            </Text>
                            <div className="flex flex-row justify-start gap-4 mt-4 animate-hero-in [animation-delay:240ms]">
                                <Link href={"/#contact"}>
                                    <Button className="px-6 py-2.5 dark:text-white">Contact Us</Button>
                                </Link>
                                <Link href={"/#about"}>
                                    <Button className="px-6 py-2.5" variant={"outline"}>
                                        Learn More
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <div className="mx-4 hidden md:flex w-full md:w-auto justify-center animate-hero-in-side [animation-delay:180ms]">
                            <HeroCarousel />
                        </div>
                    </div>
                    <div className="relative py-10 md:py-14 overflow-hidden">

                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-32 dark:bg-linear-to-r from-background to-transparent z-10" />
                            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-32 dark:bg-linear-to-l from-background to-transparent z-10" />

                            <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
                                {[...partners, ...partners].map((name, idx) => (
                                    <div
                                        key={idx}
                                        className="shrink-0 mx-3 px-8 py-4 flex items-center justify-center"
                                    >
                                        <p className="font-head text-sm md:text-base tracking-wide text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                                            {name}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </HeroBackground>
        </section >
    )
}
