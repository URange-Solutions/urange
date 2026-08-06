import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "../Reveal";
import { Text } from "../ui/Text";

interface BlogBannerProps {
  category: string;
  title: string;
  description: string | null;
  tags: string[];
  createdAt: string | null;
  bannerUrl: string | null;
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

export function BlogBanner({
  category,
  title,
  description,
  tags,
  createdAt,
  bannerUrl,
}: BlogBannerProps) {
  const hasImage = Boolean(bannerUrl);

  return (
    <section
      className={`relative overflow-hidden border-t-4 border-black dark:border-white ${
        hasImage ? "" : "bg-background"
      }`}
    >
      {hasImage && (
        <>
          <Image
            src={bannerUrl as string}
            alt={title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
  
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-background/10" />
        </>
      )}

      <Reveal
        className={`relative z-10 mx-auto max-w-6xl px-4 sm:px-6 md:px-12 lg:px-16 ${
          hasImage
            ? "min-h-[55vh] sm:min-h-[65vh] md:min-h-[75vh] flex flex-col justify-end pt-28 pb-10 md:pb-16"
            : "pt-24 md:pt-40 pb-14 md:pb-20"
        }`}
      >
        <Link
          href="/blogs"
          className={`inline-flex items-center gap-2 text-xs font-head tracking-widest transition-colors mb-6 md:mb-8 w-fit ${
            hasImage
              ? "text-white/70 hover:text-brand"
              : "text-neutral-600 dark:text-neutral-400 hover:text-brand"
          }`}
        >
          <ArrowLeft className="h-4 w-4" />
          ALL POSTS
        </Link>

        <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-5 md:mb-6">
          <span className="inline-block font-head text-xs tracking-widest text-brand border border-brand px-3 py-1 bg-background/20 backdrop-blur-sm">
            {category}
          </span>
          <span
            className={`text-xs tracking-wide ${
              hasImage ? "text-white/70" : "text-neutral-500"
            }`}
          >
            {formatDate(createdAt)}
          </span>
        </div>

        <Text
          className={`font-head text-3xl sm:text-4xl md:text-5xl lg:text-6xl max-w-4xl leading-tight mb-4 md:mb-6 ${
            hasImage ? "text-white" : "text-black dark:text-white"
          }`}
        >
          {title}
        </Text>

        {description && (
          <div
            className="max-w-2xl mb-6 md:mb-8"
            style={{
              maskImage:
                "linear-gradient(to bottom, black 60%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 60%, transparent 100%)",
            }}
          >
            <Text
              className={`text-sm sm:text-base md:text-lg leading-relaxed ${
                hasImage
                  ? "text-white/80"
                  : "text-neutral-600 dark:text-neutral-400"
              }`}
            >
              {description}
            </Text>
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className={`text-xs font-head tracking-widest uppercase px-3 py-1 border transition-colors hover:border-brand hover:text-brand ${
                  hasImage
                    ? "text-white/70 border-white/30"
                    : "text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </Reveal>
    </section>
  );
}