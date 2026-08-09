import Image from "next/image";
import { Reveal } from "../Reveal";
import { Text } from "../ui/Text";

import teamJan from '@/assets/team/janliby.jpg'
import teamCobs from '@/assets/team/cobie.jpg'
import teamMatt from '@/assets/team/matt.jpg'

const stats = [
    { value: "12+", label: "Systems deployed" },
    { value: "8K+", label: "Users served" },
    { value: "94%", label: "Client retention" },
    { value: "3wk", label: "Avg. delivery time" },
];

const team = [
<<<<<<< HEAD
    { avatar: teamJan, name: "Jan Liby Dela Costa", role: "Founder | Systems Lead | Full-Stack Developer" },
    { avatar: teamCobs, name: "Cobie Ignacio", role: "Co-Founder | Marketing Specealist | Full-Stack Developer" },
    { avatar: teamMatt, name: "Matthieu Jamiel Carandang", role: "Co-Founder | System Analyst | Quality Assurance" }
=======
  { avatar: teamJan, name: "Jan Liby Dela Costa", role: "Founder | Systems Lead | Full-Stack Developer" },
  { avatar: teamCobs, name: "Cobie Ignacio", role: "Co-Founder | Marketing Specealist | Full-Stack Developer" },
  { avatar: teamMatt, name: "Matthieu Jamiel Carandang", role: "Co-Founder | Quality Assurance | System Analyst " }
>>>>>>> 6b58888eeacd88674ae5ce8b1d8674405bcddcae
];

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
                            BUILT BY PEOPLE WHO GOT <span className="text-brand">TIRED</span> OF BAD PROCESSES
                        </Text>
                        <Text className="text-neutral-600 dark:text-neutral-400 mb-4">
                            We started by mapping the gaps that slow schools, organizations, and
                            communities down—manual processes that waste hours, systems that lose
                            important requests, resources depleted before anyone notices, and issues
                            that get reported but never resolved.
                        </Text>
                        <Text className="text-neutral-600 dark:text-neutral-400 mb-8">
                            Every product we build replaces an outdated, unreliable system with
                            something modern and dependable. We don't follow trends. We dig into
                            the root problem first, then build the simplest solution that actually
                            holds up over time.
                        </Text>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                        </div>
                    </div>

                    <div>
                        <p className="font-head text-xs tracking-widest text-neutral-400 dark:text-neutral-500 mb-6 uppercase">
                            The people behind it
                        </p>
                        <div className="flex flex-col gap-4">
                            {team.map((member, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-4 border-2 border-border p-4 hover:bg-brand hover:text-white transition-colors group"
                                >
                                    <div className="w-12 h-12 bg-brand text-white font-head text-lg flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-brand transition-colors">
                                        <Image src={member.avatar} alt={member.name} className="w-12 h-12" />
                                    </div>
                                    <div>
                                        <p className="font-head text-sm">{member.name}</p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 group-hover:text-white/80 transition-colors">
                                            {member.role}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 border-l-4 border-brand pl-4">
                            <Text className="text-neutral-600 dark:text-neutral-400 italic text-sm">
                                "A system that works should be invisible. You shouldn't have
                                to think about it—it should just handle things for you."
                            </Text>
                            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2 font-head tracking-widest">
                                — Jan Liby Dela Costa, Founder
                            </p>
                        </div>
                    </div>
                </div>
            </Reveal>
        </section>
    )
}
