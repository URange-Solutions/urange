import Link from "next/link";
import { Reveal } from "../Reveal";
import { Text } from "../ui/Text";
import { ArrowUpRight } from "lucide-react";

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

export function Blogs() {
    return (
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
    )
}