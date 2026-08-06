import { notFound } from "next/navigation";
import { eq, and, lt, gt, asc, desc } from "drizzle-orm";
import { db } from "@/database";
import { blogs } from "@/database/schema";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { BlogBanner } from "@/components/blog/BlogBanner";
import { BlogContent } from "@/components/blog/BlogContent";
import { BlogPostNav } from "@/components/blog/BlogPostNav";
import { Footer } from "@/components/Footer";

interface PageProps {
  // Next.js 15: route params are now async and must be awaited.
  params: Promise<{ slug: string }>;
}

async function getPostBySlug(slug: string) {
  const post = await db.query.blogs.findFirst({
    where: and(eq(blogs.slug, slug), eq(blogs.is_draft, false)),
  });

  return post ?? null;
}

async function getAdjacentPosts(createdAt: string | null) {
  if (!createdAt) return { previousPost: null, nextPost: null };

  const [older] = await db
    .select({ slug: blogs.slug, title: blogs.title })
    .from(blogs)
    .where(and(eq(blogs.is_draft, false), lt(blogs.created_at, createdAt)))
    .orderBy(desc(blogs.created_at))
    .limit(1);

  const [newer] = await db
    .select({ slug: blogs.slug, title: blogs.title })
    .from(blogs)
    .where(and(eq(blogs.is_draft, false), gt(blogs.created_at, createdAt)))
    .orderBy(asc(blogs.created_at))
    .limit(1);

  return { previousPost: older ?? null, nextPost: newer ?? null };
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description ?? undefined,
    openGraph: post.banner_url
      ? { images: [{ url: post.banner_url }] }
      : undefined,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { previousPost, nextPost } = await getAdjacentPosts(post.created_at);

  return (
    <main className="bg-black min-h-screen">
      <BlogHeader />

      <BlogBanner
        category={post.category}
        title={post.title}
        description={post.description}
        tags={post.tags ?? []}
        createdAt={post.created_at}
        bannerUrl={post.banner_url}
      />

      <BlogContent markdown={post.content} />

      <BlogPostNav previousPost={previousPost} nextPost={nextPost} />
      <Footer />
    </main>
  );
}