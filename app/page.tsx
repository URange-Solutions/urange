'use client'

import { useEffect, useRef, useState, type ReactNode } from "react";
import { HeroBackground } from "@/components/HeroBackground";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/retro/button";
import { Text } from "@/components/ui/Text";
import Image from "next/image";
import hero from "@/assets/hero.svg";
import { ArrowRight, Globe, Smartphone, Cpu, MessageCircle, Wrench, ArrowUpRight, LaptopMinimalCheck } from "lucide-react";
import Link from "next/link";
import teamJan from '@/assets/team/janliby.jpg'
import teamCobs from '@/assets/team/cobie.jpg'
import teamMatt from '@/assets/team/matt.jpg'
import { HeroCarousel } from "@/components/HeroCarousel";

/** Fades + slides content up into place the first time it scrolls into view. */
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

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
  { avatar: teamJan, name: "Jan Liby Dela Costa", role: "Founder | Systems Lead | Full-Stack Developer" },
  { avatar: teamCobs, name: "Cobie Ignacio", role: "Co-Founder | Marketing Specealist | Full-Stack Developer" },
  { avatar: teamMatt, name: "Matthieu Jamiel Carandang", role: "Co-Founder | System Analyst | Quality Assurance" }
];

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

const partners = [
  "Bulacan State University",
  "SM Foundation",
  "Meralco Foundation",
  "DICT Region III",
  "Note:All is dummy",
];

const blogPosts = [
  {
    date: "JUL 28, 2026",
    category: "PRODUCT",
    title: "Why we built EZVote after watching a barangay election get contested",
    excerpt: "A single miscounted ballot box turned a routine election into a three-week dispute. Here's the audit trail we built so it can't happen again.",
    href: "#",
  },
  {
    date: "JUL 12, 2026",
    category: "ENGINEERING",
    title: "Designing offline-first forms for areas with unreliable signal",
    excerpt: "Enrollment and clearance requests don't stop just because the connection drops. Our approach to sync, conflict resolution, and honest error states.",
    href: "#",
  },
  {
    date: "JUN 30, 2026",
    category: "FIELD NOTES",
    title: "What three weeks of HOA interviews taught us about gate logs",
    excerpt: "Every officer we talked to kept visitor logs differently — and every one of them had lost a record they needed. Notes from the urHOA discovery phase.",
    href: "#",
  },
];

export default function Landing() {
  return (
    <main>
      <Navbar isLanding />

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
                  <Button className="px-6 py-2.5 dark:text-white">Contact Us</Button>
                  <Button className="px-6 py-2.5" variant={"outline"}>
                    Learn More
                  </Button>
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
      </section>

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

      {/* SERVICES */}
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

      <section
        id="products"
        className="py-24 bg-background border-t-4 border-black"
      >
        <Reveal className="mx-6 md:mx-24">
          <span className="inline-block font-head text-xs tracking-widest text-brand border border-brand px-3 py-1 mb-6">
            PRODUCTS
          </span>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <Text className="font-head text-4xl md:text-5xl text-black dark:text-white max-w-xl leading-tight">
              REAL PROBLEMS.{" "}
              <span className="bg-brand text-white px-2">REAL SOFTWARE.</span>
            </Text>
            <Text className="text-neutral-600 dark:text-neutral-400 max-w-sm text-sm">
              Each product started as a visible problem we kept running into.
              We built, shipped, and iterated until it actually worked.
            </Text>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px dark:bg-neutral-700 bg-neutral-300">
            {products.map((p) => (
              <div
                key={p.name}
                className="dark:bg-neutral-900 bg-neutral-100 p-6 flex flex-col gap-4 transition-colors group"
              >
                <span
                  className={`self-start text-xs font-head px-2 py-0.5 tracking-widest ${p.badge === "Live"
                    ? "bg-brand dark:text-white"
                    : p.badge === "Beta"
                      ? "border border-brand text-brand"
                      : "border border-neutral-600 text-neutral-500"
                    }`}
                >
                  {p.badge}
                </span>

                <div>
                  <p className="dark:text-neutral-500 text-xs tracking-widest uppercase mb-1">
                    {p.tag}
                  </p>
                  <p className="font-head text-2xl dark:text-white group-hover:text-brand transition-colors">
                    {p.name}
                  </p>
                </div>

                <p className="dark:text-neutral-400 text-neutral-700 text-sm leading-relaxed flex-1">
                  {p.desc}
                </p>

                <Link href={p.href} className="self-start flex flex-row gap-1 text-xs font-head text-brand tracking-widest border-b border-brand pb-0.5 hover:text-white hover:border-white transition-colors">
                  LEARN MORE <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Button className="px-8 py-3" variant={"outline"}>
              View All Products
            </Button>
          </div>
        </Reveal>
      </section>

      {/* BLOG */}
      <section id="blog" className="py-24 bg-black border-t-4 border-black">
        <Reveal className="mx-6 md:mx-24">
          <span className="inline-block font-head text-xs tracking-widest text-brand border border-brand px-3 py-1 mb-6">
            FROM THE BLOG
          </span>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <Text className="font-head text-4xl md:text-5xl text-white max-w-xl leading-tight">
              NOTES FROM <span className="bg-brand text-white px-2">THE BUILD</span>
            </Text>
            <Text className="text-neutral-400 max-w-sm text-sm">
              Write-ups on the problems we found, the decisions we made, and
              what we'd do differently.
            </Text>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-neutral-700">
            {blogPosts.map((post) => (
              <Link
                href={post.href}
                key={post.title}
                className="bg-neutral-900 p-6 flex flex-col gap-4 hover:bg-neutral-800 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-head tracking-widest text-brand">
                    {post.category}
                  </span>
                  <span className="text-xs text-neutral-500 tracking-wide">
                    {post.date}
                  </span>
                </div>

                <p className="font-head text-xl text-white leading-snug group-hover:text-brand transition-colors">
                  {post.title}
                </p>

                <p className="text-neutral-400 text-sm leading-relaxed flex-1">
                  {post.excerpt}
                </p>

                <span className="self-start flex flex-row gap-1 text-xs font-head text-brand tracking-widest border-b border-brand pb-0.5 group-hover:text-white group-hover:border-white transition-colors">
                  READ MORE <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      {/* CTA BANNER */}
      <section className="bg-brand py-20 border-t-4 border-black">
        <Reveal className="mx-6 md:mx-24 flex flex-col md:flex-row items-center justify-between gap-8">
          <Text className="font-head text-3xl md:text-5xl text-white leading-tight max-w-2xl text-center md:text-left">
            STILL RUNNING THIS ON PAPER, SPREADSHEETS, OR GROUP CHATS?
          </Text>
          <Link href="#contact" className="shrink-0">
            <Button className="px-8 py-3 bg-white text-brand font-head tracking-widest hover:bg-black hover:text-white transition-colors">
              LET'S FIX THAT <ArrowRight className="h-4 w-4 ml-2 inline" />
            </Button>
          </Link>
        </Reveal>
      </section>

      <section id="contact" className="py-24 bg-background border-t-4 border-black">
        <Reveal className="mx-6 md:mx-24">
          <span className="inline-block font-head text-xs tracking-widest text-brand border border-brand px-3 py-1 mb-6">
            CONTACT
          </span>

          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <Text className="font-head text-4xl md:text-5xl leading-tight mb-6 text-black dark:text-white">
                GOT A PROBLEM WORTH <span className="text-brand">SOLVING?</span>
              </Text>
              <Text className="text-neutral-600 dark:text-neutral-400 mb-8">
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
                    <p className="font-head text-xs tracking-widest text-neutral-400 dark:text-neutral-500 w-20 shrink-0">
                      {item.label}
                    </p>
                    <p className="text-neutral-800 dark:text-neutral-400">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <form className="flex flex-col gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-head text-xs tracking-widest text-neutral-500 dark:text-neutral-400">
                    NAME
                  </label>
                  <input
                    type="text"
                    placeholder="Juan dela Cruz"
                    className="border-2 border-input bg-background text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-head text-xs tracking-widest text-neutral-500 dark:text-neutral-400">
                    EMAIL
                  </label>
                  <input
                    type="email"
                    placeholder="juan@company.com"
                    className="border-2 border-input bg-background text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-head text-xs tracking-widest text-neutral-500 dark:text-neutral-400">
                  WHAT DO YOU WANT?
                </label>
                <select className="border-2 border-input px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors bg-background text-black dark:text-white appearance-none">
                  <option value="">Select a category</option>
                  <option>Web Development</option>
                  <option>Mobile Development</option>
                  <option>IoT and Arduinos</option>
                  <option>Consultation</option>
                  <option>Something else</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-head text-xs tracking-widest text-neutral-500 dark:text-neutral-400">
                  DETAILS
                </label>
                <textarea
                  rows={5}
                  placeholder="Describe the process idea or the problem you want us to solve, who it affects, and how often..."
                  className="border-2 border-input bg-background text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors resize-none"
                />
              </div>

              <Button type="submit" className="py-3 font-head tracking-widest">
                SEND MESSAGE
              </Button>
            </form>
          </div>
        </Reveal>
      </section>
      <Footer />
    </main>
  );
}