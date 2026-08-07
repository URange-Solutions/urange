import Link from "next/link";
import { Reveal } from "../Reveal";
import { Text } from "../ui/Text";
import { ArrowRight } from "lucide-react";
import { Button } from "../retro/button";


const products = [
  {
    tag: "ELECTION MANAGEMENT",
    name: "EZVote",
    desc: "Hold your organization's elections entirely online. Set up candidates, send voters a secure ballot link, and watch results tally live with a full audit trail.",
    badge: "Beta",
    href: "https://ezvote.urange.tech"
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

export function Products() {
    return (
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-300 dark:bg-neutral-700">
            {products.map((p) => (
              <div
                key={p.name}
                className="bg-neutral-100 dark:bg-neutral-900 hover:bg-brand dark:hover:bg-brand p-6 flex flex-col gap-4 transition-colors group"
              >
                <span
                  className={`self-start text-xs font-head px-2 py-0.5 tracking-widest transition-colors ${p.badge === "Live"
                    ? "bg-brand text-white"
                    : p.badge === "Beta"
                      ? "border border-brand text-brand group-hover:border-white group-hover:text-white"
                      : "border border-neutral-600 text-neutral-500 group-hover:border-white group-hover:text-white"
                    }`}
                >
                  {p.badge}
                </span>

                <div>
                  <p className="text-xs tracking-widest uppercase mb-1 text-neutral-500 group-hover:text-white/70 transition-colors">
                    {p.tag}
                  </p>
                  <p className="font-head text-2xl text-black dark:text-white group-hover:text-white transition-colors">
                    {p.name}
                  </p>
                </div>

                <p className="text-neutral-700 dark:text-neutral-400 group-hover:text-white/90 text-sm leading-relaxed flex-1 transition-colors">
                  {p.desc}
                </p>

                <Link
                  href={p.href}
                  className="self-start flex flex-row gap-1 text-xs font-head text-brand tracking-widest border-b border-brand pb-0.5 group-hover:text-white group-hover:border-white transition-colors"
                >
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
    )
}