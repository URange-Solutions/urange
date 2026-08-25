import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/retro/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Metadata } from "next";

interface ValueCard {
    label: string;
    title: string;
    desc: string;
}

interface TeamMember {
    initials: string;
    name: string;
    role: string;
    image: string;
    description: string;
    skills: string[];
}

const pillars: ValueCard[] = [
    {
        label: "Mission",
        title: "We turn everyday problems into systems that work",
        desc: "We take the manual work, the broken process, the paper forms, the lost requests, the things everyone complains about but no one fixes, and we turn them into software that actually works. Simple to understand, simple to use, made for the people who use it every day.",
    },
    {
        label: "Vision",
        title: "A future where good systems are normal, not rare",
        desc: "We want schools, foundations, and government offices to have systems that work well, as a normal thing, not something special. Every project we build helps these groups spend less time struggling with their own tools, and more time doing the work that really matters.",
    },
];

const team: TeamMember[] = [
    {
        initials: "JD",
        name: "Jan Liby Dela Costa",
        role: "Founder & Full-Stack Developer",
        image: "/team/janliby.jpg",
        description: "Leads product direction and architecture, and writes a good chunk of the codebase across every client project.",
        skills: ["Next.js", "React", "TypeScript", "System Design"],
    },
    {
        initials: "CI",
        name: "Cobie Ignacio",
        role: "Marketing & Client Partnerships & System Design",
        image: "/team/cobie.jpg",
        description: "Owns client relationships from first call to final handoff, and shapes how Urange talks about its work.",
        skills: ["Client Strategy", "Marketing", "Copywriting"],
    },
    {
        initials: "MC",
        name: "Matthieu Jamiel Carrandang",
        role: "Networking Specialist & Quality Assurance",
        image: "/team/matt.jpg",
        description: "Keeps infrastructure and deployments reliable, and stress-tests every release before it reaches users.",
        skills: ["Networking", "QA", "DevOps"],
    },
    {
        initials: "MS",
        name: "Marvin Quillo Saik",
        role: "Full-Stack Developer & System Design",
        image: "/team/marvin.jpg",
        description: "Builds and ships features end to end, from database schema to the pixels users actually click on.",
        skills: ["React", "Node.js", "PostgreSQL"],
    },
];

export const metadata: Metadata = {
    title: "About URange Solutions",
    description: " A small organization that builds reliable software for schools, foundations, and government offices..",
    icons: {
        icon: '/icon.png'
    }
};

export default function AboutPage() {
    return (
        <>
            <main className="pt-32 pb-24 bg-background overflow-x-hidden">
                <Navbar />
                <div className="relative bg-brand pt-20 md:pt-24 pb-12 md:pb-16 -mt-16 mb-8 overflow-hidden">

                    <div className="absolute -top-24 -left-24 w-72 h-72 md:w-96 md:h-96 border-[40px] md:border-[55px] border-white/10 rounded-full pointer-events-none" />
                    <div className="absolute -top-10 -left-10 w-44 h-44 md:w-60 md:h-60 border-[8px] md:border-[10px] border-white/10 rounded-full pointer-events-none" />

                    <div className="absolute -bottom-28 -right-14 w-40 h-40 md:w-52 md:h-52 border-[20px] md:border-[28px] border-black/10 rounded-full pointer-events-none" />
                    <div className="absolute -bottom-16 right-10 w-24 h-24 md:w-32 md:h-32 border-[5px] md:border-[6px] border-black/10 rounded-full pointer-events-none" />

                    <svg className="hidden md:block absolute left-0 top-1/3 w-32 h-64 pointer-events-none opacity-40 -scale-x-100" viewBox="0 0 128 256" fill="none">
                        <path d="M 128 8 A 120 120 0 0 1 128 248" className="stroke-white" strokeWidth="1.5" strokeDasharray="6 6" />
                    </svg>

                    <div
                        className="hidden sm:block absolute top-8 right-6 w-32 h-28 md:w-44 md:h-36 pointer-events-none opacity-[0.18] rounded text-white"
                        style={{
                            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                            backgroundSize: '12px 12px'
                        }}
                    />

                    <div
                        className="hidden sm:block absolute bottom-8 left-6 w-36 h-32 md:w-52 md:h-40 pointer-events-none opacity-[0.18] rounded text-black"
                        style={{
                            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                            backgroundSize: '12px 12px'
                        }}
                    />

                    <div
                        className="hidden md:block absolute top-0 left-0 w-40 h-28 pointer-events-none opacity-[0.10] text-black"
                        style={{
                            backgroundImage: 'repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)',
                            backgroundSize: '8px 8px'
                        }}
                    />

                    <div
                        className="hidden md:block absolute bottom-0 right-0 w-40 h-28 pointer-events-none opacity-[0.10] text-white"
                        style={{
                            backgroundImage: 'repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)',
                            backgroundSize: '8px 8px'
                        }}
                    />

                    <svg className="absolute top-0 left-0 w-16 h-16 md:w-24 md:h-24 pointer-events-none" viewBox="0 0 96 96" fill="none">
                        <line x1="0" y1="0" x2="60" y2="60" className="stroke-white" strokeWidth="1" opacity="0.25" />
                        <line x1="0" y1="20" x2="40" y2="60" className="stroke-white" strokeWidth="1" opacity="0.18" />
                        <line x1="20" y1="0" x2="80" y2="60" className="stroke-white" strokeWidth="1" opacity="0.12" />
                    </svg>

                    <svg className="absolute bottom-0 right-0 w-16 h-16 md:w-24 md:h-24 pointer-events-none" viewBox="0 0 96 96" fill="none">
                        <line x1="96" y1="96" x2="36" y2="36" className="stroke-black" strokeWidth="1" opacity="0.2" />
                        <line x1="96" y1="76" x2="56" y2="36" className="stroke-black" strokeWidth="1" opacity="0.15" />
                        <line x1="76" y1="96" x2="16" y2="36" className="stroke-black" strokeWidth="1" opacity="0.1" />
                    </svg>

                    <svg className="hidden sm:block absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none opacity-60" width="20" height="20" viewBox="0 0 20 20">
                        <polygon points="10,1 19,10 10,19 1,10" fill="none" className="stroke-white" strokeWidth="1.5" />
                        <polygon points="10,5 15,10 10,15 5,10" className="fill-white" opacity="0.4" />
                    </svg>

                    <div className="relative z-10 px-6 md:px-24">
                        <Text className="font-head text-2xl md:text-4xl leading-tight mb-3 text-white">
                            ABOUT URANGE SOLUTIONS
                        </Text>
                        <Text className="text-sm md:text-base text-white/70 max-w-xl">
                            A small organization that builds reliable software for schools, foundations, and government offices.
                        </Text>
                    </div>
                </div>
                <Reveal className="mx-6 md:mx-24 max-w-4xl">
                    <span className="inline-block font-head text-xs tracking-widest text-brand border border-brand px-3 py-1 mb-6">
                        OUR STORY
                    </span>
                    <Text className="font-head text-3xl sm:text-4xl md:text-6xl leading-tight mb-8 text-black dark:text-white">
                        WE STARTED BECAUSE ONE TOO MANY GOOD ORGANIZATIONS WAS RUNNING ON{" "}
                        <span className="bg-brand text-white px-2">DUCT TAPE</span>
                    </Text>
                    <div className="grid sm:grid-cols-2 gap-8">
                        <Text className="text-neutral-600 dark:text-neutral-400">
                            It started with a pattern we couldn't ignore, schools tracking requests on
                            paper, foundations spending hours wrestling with spreadsheets, and offices
                            facing the same problems year after year without a system built to solve
                            them. These weren't invisible problems. Everyone could see them. What was
                            missing was someone willing to understand the mess, find what was actually
                            broken, and build something that worked.
                        </Text>

                        <Text className="text-neutral-600 dark:text-neutral-400">
                            So that's what we set out to do. We're a small organization that works
                            directly with schools, foundations, and government offices to turn
                            real-world problems into practical, dependable software. We don't believe
                            in building systems just for the sake of having them. We build with the
                            people who use them, shaped by the realities of their everyday work.
                            Every project teaches us something new and pushes us toward building
                            systems that last.
                        </Text>
                    </div>
                </Reveal>

                <Reveal className="mx-6 md:mx-24 mt-16 md:mt-24">
                    <div className="grid sm:grid-cols-2 gap-6">
                        {pillars.map((p, idx) => (
                            <div
                                key={idx}
                                className="border-2 border-border p-6 md:p-8 hover:bg-brand hover:text-white transition-colors group"
                            >
                                <p className="text-[10px] tracking-widest text-brand group-hover:text-white/80 uppercase mb-3">
                                    {p.label}
                                </p>
                                <p className="font-head text-xl md:text-3xl leading-tight mb-4">
                                    {p.title}
                                </p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 group-hover:text-white/80 transition-colors">
                                    {p.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </Reveal>

                <Reveal className="mx-6 md:mx-24 mt-16 md:mt-24">
                    <span className="inline-block font-head text-xs tracking-widest text-brand border border-brand px-3 py-1 mb-6">
                        THE TEAM
                    </span>
                    <Text className="font-head text-2xl sm:text-3xl md:text-4xl leading-tight mb-10 text-black dark:text-white">
                        SMALL TEAM, DIRECT ACCESS, NO HAND-OFFS
                    </Text>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {team.map((m, idx) => (
                            <div
                                key={idx}
                                className="group relative border-2 border-border overflow-hidden"
                            >
                                {/* Photo */}
                                <div className="relative w-full aspect-[3/4] bg-neutral-200 dark:bg-neutral-800">
                                    <Image
                                        src={m.image}
                                        alt={m.name}
                                        fill
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                        className="object-cover transition-all duration-300"
                                    />

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-brand/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-center">
                                        <p className="text-xs text-white/90 leading-snug mb-3">
                                            {m.description}
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
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

                                {/* Name / role */}
                                <div className="p-4 text-center">
                                    <p className="font-head text-sm text-black dark:text-white">{m.name}</p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 uppercase tracking-wide">
                                        {m.role}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Reveal>
            </main>
            <Footer />
        </>
    );
}