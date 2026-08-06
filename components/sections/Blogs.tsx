import Link from "next/link";
import { Reveal } from "../Reveal";
import { Text } from "../ui/Text";
import { ArrowUpRight } from "lucide-react";

type BlogRow = {
  id: string;
  created_at: string | null;
  description: string | null;
  slug: string;
  category: string;
  title: string;
  updated_at: string | null;
};

interface BlogsProps {
  blogs: BlogRow[];
}

function formatDate(value: string | null) {
  if (!value) return "";
  return new Date(value)
    .toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
    .toUpperCase()
    .replace(",", ",");
}

export function Blogs({ blogs }: BlogsProps) {
  if (blogs.length === 0) return null;

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
            {blogs.map((post) => (
              <Link
                href={post.id}
                key={post.title}
                className="bg-neutral-900 p-6 flex flex-col gap-4 hover:bg-neutral-800 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-head tracking-widest uppercase text-brand">
                    {post.category}
                  </span>
                  <span className="text-xs text-neutral-500 tracking-wide">
                    {formatDate(post.created_at)}
                  </span>
                </div>

                <p className="font-head text-xl text-white leading-snug line-clamp-2 group-hover:text-brand transition-colors">
                  {post.title}
                </p>

                <p className="text-neutral-400 text-sm leading-relaxed flex-1 line-clamp-3">
                  {post.description}
                </p>

                <span className="self-start flex flex-row gap-1 text-xs font-head text-brand tracking-widest border-b border-brand pb-0.5 group-hover:text-white group-hover:border-white transition-colors">
                  READ MORE <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
      </Reveal>
    </section>
  );
}