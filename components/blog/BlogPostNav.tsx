import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Reveal } from "../Reveal";

interface AdjacentPost {
  slug: string;
  title: string;
}

interface BlogPostNavProps {
  previousPost: AdjacentPost | null;
  nextPost: AdjacentPost | null;
}

export function BlogPostNav({ previousPost, nextPost }: BlogPostNavProps) {
  if (!previousPost && !nextPost) return null;

  return (
    <section className="border-t-2 border-dashed border-border bg-background">
      <Reveal className="mx-auto max-w-6xl px-4 sm:px-6 md:px-12 lg:px-16 py-14 md:py-20">
        <div className="grid sm:grid-cols-2 gap-px bg-neutral-200 dark:bg-neutral-700">
          <Link
            href={previousPost ? `/blogs/${previousPost.slug}` : "#"}
            aria-disabled={!previousPost}
            tabIndex={previousPost ? undefined : -1}
            className={`bg-neutral-50 dark:bg-neutral-900 p-6 md:p-8 flex flex-col gap-3 transition-colors group ${previousPost
              ? "hover:bg-neutral-100 dark:hover:bg-neutral-800"
              : "pointer-events-none opacity-40"
              }`}
          >
            <span className="flex items-center gap-2 text-xs font-head tracking-widest text-brand">
              <ArrowLeft className="h-4 w-4" />
              PREVIOUS
            </span>
            <span className="font-head text-lg md:text-xl text-black dark:text-white leading-snug line-clamp-2 group-hover:text-brand transition-colors">
              {previousPost?.title ?? "No earlier posts"}
            </span>
          </Link>

          <Link
            href={nextPost ? `/blogs/${nextPost.slug}` : "#"}
            aria-disabled={!nextPost}
            tabIndex={nextPost ? undefined : -1}
            className={`bg-neutral-50 dark:bg-neutral-900 p-6 md:p-8 flex flex-col gap-3 items-start sm:items-end sm:text-right transition-colors group ${nextPost
              ? "hover:bg-neutral-100 dark:hover:bg-neutral-800"
              : "pointer-events-none opacity-40"
              }`}
          >
            <span className="flex items-center gap-2 text-xs font-head tracking-widest text-brand">
              NEXT
              <ArrowRight className="h-4 w-4" />
            </span>
            <span className="font-head text-lg md:text-xl text-black dark:text-white leading-snug line-clamp-2 group-hover:text-brand transition-colors">
              {nextPost?.title ?? "No newer posts"}
            </span>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}