"use client";

import Image from "next/image";

interface TeamMember {
    initials: string;
    name: string;
    role: string;
    image: string;
    description: string;
    skills: string[];
}

interface TeamCarouselProps {
    team: TeamMember[];
}

export function TeamCarousel({ team }: TeamCarouselProps) {
    // Duplicate the list so the loop is seamless
    const items = [...team, ...team];

    return (
        <div
            className="relative overflow-hidden"
            style={{
                maskImage:
                    "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
                WebkitMaskImage:
                    "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            }}
        >
            <div className="team-marquee-track flex w-max">
                {items.map((m, idx) => (
                    <div
                        key={idx}
                        className="shrink-0 px-2 md:px-3 w-[85vw] sm:w-[45vw] md:w-[31vw] lg:w-[29vw] xl:w-[26vw]"
                    >
                        <div className="relative border-2 border-border overflow-hidden">
                            <div className="relative w-full aspect-[3/4] bg-neutral-200 dark:bg-neutral-800">
                                <Image
                                    src={m.image}
                                    alt={m.name}
                                    fill
                                    sizes="(max-width: 640px) 85vw, (max-width: 768px) 45vw, (max-width: 1024px) 31vw, 26vw"
                                    className="object-cover"
                                    draggable={false}
                                />

                                {/* Fading brand-color overlay — bottom portion only */}
                                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-brand via-brand/60 to-transparent opacity-30" />

                                {/* Details on top of fade */}
                                <div className="absolute inset-x-0 bottom-0 p-4">
                                    <p className="font-head text-sm text-white">
                                        {m.name}
                                    </p>
                                    <p className="text-xs text-white/80 mt-1 uppercase tracking-wide">
                                        {m.role}
                                    </p>

                                    <p className="text-xs text-white/90 leading-snug mt-2">
                                        {m.description}
                                    </p>

                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {m.skills.map((skill, sIdx) => (
                                            <span
                                                key={sIdx}
                                                className="text-[10px] tracking-wide uppercase border border-white/40 text-white px-2 py-0.5"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .team-marquee-track {
                    animation: team-marquee 30s linear infinite;
                }
                .team-marquee-track:hover {
                    animation-play-state: paused;
                }
                @keyframes team-marquee {
                    from {
                        transform: translateX(0);
                    }
                    to {
                        transform: translateX(-50%);
                    }
                }
                @media (max-width: 640px) {
                    .team-marquee-track {
                        animation-duration: 22s;
                    }
                }
            `}</style>
        </div>
    );
}