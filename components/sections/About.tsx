"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "../Reveal";
import { Text } from "../ui/Text";

interface Stat {
    value: string;
    label: string;
}

interface TimelineStep {
    stage: string;
    title: string;
    desc: string;
}

const stats: Stat[] = [
    { value: "12+", label: "Systems deployed" },
    { value: "8K+", label: "Users served" },
    { value: "94%", label: "Client retention" },
    { value: "3wk", label: "Avg. delivery time" },
];

const timeline: TimelineStep[] = [
  { 
    stage: "Step 1", 
    title: "Find the problem", 
    desc: "We figure out where time, requests, or work are getting stuck." 
  },
  { 
    stage: "Step 2", 
    title: "Plan it simple", 
    desc: "We design the easiest fix for the real problem, not a band-aid solutions." 
  },
  { 
    stage: "Step 3", 
    title: "Build it fast", 
    desc: "We build only what you need. You get working software in weeks, not months." 
  },
  { 
    stage: "Step 4", 
    title: "Keep it running", 
    desc: "We stay to improve and maintain it, so it keeps working long-term." 
  },
];

interface TimelineItemProps {
    item: TimelineStep;
    index: number;
    isLast: boolean;
}

function TimelineItem({ item, index, isLast }: TimelineItemProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.unobserve(node);
                }
            },
            { threshold: 0.3, rootMargin: "0px 0px -10% 0px" }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className="relative pl-14">
            <div
                className={`absolute left-0 top-0 w-8 h-8 rounded-full bg-brand text-white font-head text-sm flex items-center justify-center transition-all duration-500 ${
                    visible ? "scale-100 opacity-100" : "scale-50 opacity-0"
                }`}
            >
                {index + 1}
            </div>

            {!isLast && (
                <div className="absolute left-[15px] top-8 bottom-[-1.5rem] w-0.5 bg-border overflow-hidden">
                    <div
                        className={`absolute inset-0 bg-brand origin-top transition-transform duration-700 ${
                            visible ? "scale-y-100" : "scale-y-0"
                        }`}
                    />
                </div>
            )}

            <div
                className={`transition-all duration-700 ease-out ${
                    visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
                }`}
            >
                <div className="border-2 border-border p-4 hover:bg-brand hover:text-white transition-colors group">
                    <p className="text-[10px] tracking-widest text-brand group-hover:text-white/80 uppercase mb-1">
                        {item.stage}
                    </p>
                    <p className="font-head text-sm">{item.title}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 group-hover:text-white/80 transition-colors mt-1">
                        {item.desc}
                    </p>
                </div>
            </div>
        </div>
    );
}

export function About() {
    return (
        <section id="about" className="py-24 bg-background">
            <Reveal className="mx-6 md:mx-24">
                <span className="inline-block font-head text-xs tracking-widest text-brand border border-brand px-3 py-1 mb-6">
                    ABOUT US
                </span>

                <div className="grid md:grid-cols-2 gap-16 items-start">
                    <div>
                        <Text className="font-head text-4xl md:text-5xl leading-tight mb-6 text-black dark:text-white">
                            WE BUILD FOR PEOPLE WHO ARE <span className="text-brand">TIRED</span> OF BAD PROCESSES
                        </Text>
                        <Text className="text-neutral-600 dark:text-neutral-400 mb-4">
                            We started by mapping the gaps that slow schools, organizations, and
                            communities down, manual processes that waste hours, systems that lose
                            important requests, resources depleted before anyone notices, and issues
                            that get reported but never resolved.
                        </Text>
                        <Text className="text-neutral-600 dark:text-neutral-400 mb-8">
                            Every product we build replaces an outdated, unreliable system with
                            something modern and dependable. We don't follow trends. We dig into
                            the root problem first, then build the simplest solution that actually
                            holds up over time.
                        </Text>

                        {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {stats.map((s, idx) => (
                                <div
                                    key={idx}
                                    className="border-2 border-border p-4 text-center"
                                >
                                    <p className="font-head text-3xl text-brand">{s.value}</p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 uppercase tracking-wide">
                                        {s.label}
                                    </p>
                                </div>
                            ))}
                        </div> */}
                    </div>

                    <div>
                        <p className="font-head text-xs tracking-widest text-neutral-400 dark:text-neutral-500 mb-6 uppercase">
                            How we work
                        </p>
                        <div className="flex flex-col gap-8">
                            {timeline.map((t, idx) => (
                                <TimelineItem
                                    key={idx}
                                    item={t}
                                    index={idx}
                                    isLast={idx === timeline.length - 1}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </Reveal>
        </section>
    )
}