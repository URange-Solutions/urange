import { HeroBackground } from "@/components/HeroBackground";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/retroui/Button";
import { Text } from "@/components/retroui/Text";
import Image from "next/image";
import hero from "@/assets/hero.svg";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const products = [
  {
    tag: "ELECTION MANAGEMENT",
    name: "EZVote",
    desc: "Hold your organization's elections entirely online. Set up candidates, send voters a secure ballot link, and watch results tally live with a full audit trail.",
    badge: "Beta",
    href: "https://ezvote.vercel.app"
  },
  {
    tag: "ENROLLMENT SYSTEM",
    name: "InnrollPH",
    desc: "Accept applications without paper forms or walk-ins. Review submissions, shortlist candidates, and notify accepted students from one dashboard.",
    badge: "Coming soon",
    href: "#"
  },
  {
    tag: "HOA MANAGEMENT",
    name: "urHOA",
    desc: "Collect dues, handle maintenance requests, log gate visitors, and post announcements from one place. Homeowners get a portal and officers get full visibility.",
    badge: "Coming soon",
    href: "#"
  },
  {
    tag: "BARANGAY SERVICES",
    name: "BarangayKo",
    desc: "Let residents request clearances, cedulas, and permits online without going to the hall. Process and approve requests digitally, then notify them when documents are ready.",
    badge: "Coming soon",
    href: "#"
  },
];

const stats = [
  { value: "12+", label: "Systems deployed" },
  { value: "8K+", label: "Users served" },
  { value: "94%", label: "Client retention" },
  { value: "3wk", label: "Avg. delivery time" },
];

const team = [
  { initials: "JD", name: "Jan Liby Dela Costa", role: "Founder & Systems Lead" },
  { initials: "JD", name: "Jan Liby Dela Costa", role: "Marketing & Product Design" },
  { initials: "JD", name: "Jan Liby Dela Costa", role: "Full-stack Developer" },
];

export default function Landing() {
  return (
    <main>
      <Navbar isLanding />

      <section id="home">
        <HeroBackground>
          <div className="min-h-[calc(100dvh+80px)] flex flex-row justify-between items-center mx-6 md:mx-24">
            <div className="max-w-2xl text-left mt-16 md:mt-0">
              <Text className="text-brand font-head text-5xl md:text-6xl leading-12 md:leading-16">
                <span className="text-black">
                  LET<span className="text-brand">'</span>S TURN VISIBLE{" "}
                </span>
                PROBLEMS INTO{" "}
                <span className="bg-brand text-white px-2">SYSTEMS</span>
              </Text>
              <Text className="text-neutral-600 md:text-lg mt-4">
                We focused on creating practical digital solutions for
                real-world problems. We aim to simplify everyday processes by
                turning visible challenges into efficient, accessible, and
                reliable systems through technology.
              </Text>
              <div className="flex flex-row justify-start gap-4 mt-4">
                <Button className="px-6 py-2.5">Get Started</Button>
                <Button className="px-6 py-2.5" variant={"outline"}>
                  Learn More
                </Button>
              </div>
            </div>
            <div className="mx-4 hidden md:flex">
              <Image src={hero} alt="Markup from storyset" />
            </div>
          </div>
        </HeroBackground>
      </section>

      <section id="about" className="py-24 bg-white">
        <div className="mx-6 md:mx-24">
          <span className="inline-block font-head text-xs tracking-widest text-brand border border-brand px-3 py-1 mb-6">
            ABOUT US
          </span>

          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <Text className="font-head text-4xl md:text-5xl leading-tight text-black mb-6">
                BUILT BY PEOPLE WHO GOT <span className="text-brand">TIRED</span> OF BAD PROCESSES
              </Text>
              <Text className="text-neutral-600 mb-4">
                We started by mapping the gaps that slow schools, organizations, and
                communities down—manual processes that waste hours, systems that lose
                important requests, resources depleted before anyone notices, and issues
                that get reported but never resolved.
              </Text>
              <Text className="text-neutral-600 mb-8">
                Every product we build replaces an outdated, unreliable system with
                something modern and dependable. We don't follow trends. We dig into
                the root problem first, then build the simplest solution that actually
                holds up over time.
              </Text>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map((s, idx) => (
                  <div
                    key={idx}
                    className="border-2 border-black p-4 text-center"
                  >
                    <p className="font-head text-3xl text-brand">{s.value}</p>
                    <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wide">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="font-head text-xs tracking-widest text-neutral-400 mb-6 uppercase">
                The people behind it
              </p>
              <div className="flex flex-col gap-4">
                {team.map((member, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 border-2 border-black p-4 hover:bg-brand hover:text-white transition-colors group"
                  >
                    <div className="w-12 h-12 bg-brand text-white font-head text-lg flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-brand transition-colors">
                      {member.initials}
                    </div>
                    <div>
                      <p className="font-head text-sm">{member.name}</p>
                      <p className="text-xs text-neutral-500 group-hover:text-white/80 transition-colors">
                        {member.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 border-l-4 border-brand pl-4">
                <Text className="text-neutral-600 italic text-sm">
                  "A system that works should be invisible. You shouldn't have
                  to think about it—it should just handle things for you."
                </Text>
                <p className="text-xs text-neutral-400 mt-2 font-head tracking-widest">
                  — Jan Liby Dela Costa, Founder
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="products"
        className="py-24 bg-neutral-950 border-t-4 border-black"
      >
        <div className="mx-6 md:mx-24">
          <span className="inline-block font-head text-xs tracking-widest text-brand border border-brand px-3 py-1 mb-6">
            PRODUCTS
          </span>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <Text className="font-head text-4xl md:text-5xl text-white max-w-xl leading-tight">
              REAL PROBLEMS.{" "}
              <span className="bg-brand text-white px-2">REAL SOFTWARE.</span>
            </Text>
            <Text className="text-neutral-400 max-w-sm text-sm">
              Each product started as a visible problem we kept running into.
              We built, shipped, and iterated until it actually worked.
            </Text>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-700">
            {products.map((p) => (
              <div
                key={p.name}
                className="bg-neutral-900 p-6 flex flex-col gap-4 hover:bg-neutral-800 transition-colors group"
              >
                <span
                  className={`self-start text-xs font-head px-2 py-0.5 tracking-widest ${p.badge === "Live"
                    ? "bg-brand text-white"
                    : p.badge === "Beta"
                      ? "border border-brand text-brand"
                      : "border border-neutral-600 text-neutral-500"
                    }`}
                >
                  {p.badge}
                </span>

                <div>
                  <p className="text-neutral-500 text-xs tracking-widest uppercase mb-1">
                    {p.tag}
                  </p>
                  <p className="font-head text-2xl text-white group-hover:text-brand transition-colors">
                    {p.name}
                  </p>
                </div>

                <p className="text-neutral-400 text-sm leading-relaxed flex-1">
                  {p.desc}
                </p>

                <Link href={p.href} className="self-start flex flex-row gap-1 text-xs font-head text-brand tracking-widest border-b border-brand pb-0.5 hover:text-white hover:border-white transition-colors">
                  LEARN MORE <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Button className="px-8 py-3 text-white" variant={"outline"}>
              View All Products
            </Button>
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 bg-white border-t-4 border-black">
        <div className="mx-6 md:mx-24">
          <span className="inline-block font-head text-xs tracking-widest text-brand border border-brand px-3 py-1 mb-6">
            CONTACT
          </span>

          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <Text className="font-head text-4xl md:text-5xl text-black leading-tight mb-6">
                GOT A PROBLEM WORTH <span className="text-brand">SOLVING?</span>
              </Text>
              <Text className="text-neutral-600 mb-8">
                Tell us about it. We'll look at it honestly—if it's a good fit
                we'll propose a system. If it's not, we'll say so and point you
                in the right direction.
              </Text>

              <div className="flex flex-col gap-4">
                {[
                  { label: "EMAIL", value: "urangesystems@proton.me" },
                  { label: "PHONE", value: "+63 924 477 2453" },
                  { label: "LOCATION", value: "Bulacan, Philippines" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-4 border-l-4 border-brand pl-4"
                  >
                    <p className="font-head text-xs tracking-widest text-neutral-400 w-20 shrink-0">
                      {item.label}
                    </p>
                    <p className="text-neutral-800">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <form className="flex flex-col gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-head text-xs tracking-widest text-neutral-500">
                    NAME
                  </label>
                  <input
                    type="text"
                    placeholder="Juan dela Cruz"
                    className="border-2 border-black px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-head text-xs tracking-widest text-neutral-500">
                    EMAIL
                  </label>
                  <input
                    type="email"
                    placeholder="juan@company.com"
                    className="border-2 border-black px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-head text-xs tracking-widest text-neutral-500">
                  WHAT PROBLEM ARE YOU FACING?
                </label>
                <select className="border-2 border-black px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors bg-white appearance-none">
                  <option value="">Select a category</option>
                  <option>Queue or waitlist management</option>
                  <option>Appointment scheduling</option>
                  <option>Inventory or stock tracking</option>
                  <option>Community or civic reporting</option>
                  <option>Something else</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-head text-xs tracking-widest text-neutral-500">
                  DETAILS
                </label>
                <textarea
                  rows={5}
                  placeholder="Describe the process that's broken, who it affects, and how often..."
                  className="border-2 border-black px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors resize-none"
                />
              </div>

              <Button type="submit" className="py-3 font-head tracking-widest">
                SEND MESSAGE
              </Button>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}