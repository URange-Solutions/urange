import { Reveal } from "../Reveal";
import { Text } from "../ui/Text";
import { Globe, Smartphone, Cpu, Wrench, LaptopMinimalCheck } from "lucide-react";

const services = [
    {
        icon: Globe,
        name: "Web Development",
        desc: "Custom web apps and dashboards built for the process, not a template. From internal tools to public-facing portals.",
    },
    {
        icon: Smartphone,
        name: "Mobile Development",
        desc: "Android and iOS apps for field teams, residents, and members who need access on the go.",
    },
    {
        icon: Cpu,
        name: "IoT & Arduinos",
        desc: "Sensors, gate systems, and hardware integrations that connect the physical side of your operation to your software.",
    },
    {
        icon: LaptopMinimalCheck,
        name: "PC Repair",
        desc: "Fast troubleshooting, hardware upgrades, software fixes, and system maintenance for desktops and laptops.",
    },
    {
        icon: Wrench,
        name: "Maintenance & Support",
        desc: "Systems don't stop needing attention after launch. We patch, monitor, and extend what we build.",
    },
];

export function Services() {
    return (
        <section id="services" className="py-24 bg-black border-t-4 border-black">
            <Reveal className="mx-6 md:mx-24">
                <span className="inline-block font-head text-xs tracking-widest text-brand border border-brand px-3 py-1 mb-6">
                    SERVICES
                </span>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
                    <Text className="font-head text-4xl md:text-5xl max-w-xl leading-tight text-white">
                        WHAT WE <span className="bg-brand text-white px-2">BUILD</span> FOR YOU
                    </Text>
                    <Text className="text-neutral-400 max-w-sm text-sm">
                        Pick a starting point, or tell us the process and we'll figure out
                        which of these it actually needs.
                    </Text>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-px bg-neutral-700">
                    {services.map((s) => (
                        <div
                            key={s.name}
                            className="bg-neutral-900 p-6 flex flex-col gap-4 hover:bg-brand transition-colors group"
                        >
                            <s.icon className="h-7 w-7 text-brand group-hover:text-white transition-colors" strokeWidth={1.5} />
                            <p className="font-head text-lg leading-snug text-white">{s.name}</p>
                            <p className="text-neutral-400 group-hover:text-white/90 text-sm leading-relaxed transition-colors">
                                {s.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </Reveal>
        </section>
    )
}