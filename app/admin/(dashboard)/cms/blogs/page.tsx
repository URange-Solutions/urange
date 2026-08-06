import { db } from "@/database"
import BlogManagementPage from "./BlogPage"
import { and, eq, ilike, or } from "drizzle-orm"
import { blogs } from "@/database/schema"
import { getAdminSession } from "@/lib/auth"

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string }>
}

export default async function BlogWrapper({ searchParams }: PageProps) {
  const session = await getAdminSession()
  if (!session?.admins) return null

  const { q, status } = await searchParams

  const conditions = []

  if (q) {
    conditions.push(
      or(ilike(blogs.title, `%${q}%`), ilike(blogs.category, `%${q}%`))
    )
  }

  if (status === "published") conditions.push(eq(blogs.is_draft, false))
  if (status === "draft") conditions.push(eq(blogs.is_draft, true))

  const allBlogs = await db.query.blogs.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    orderBy: (blogs, { desc }) => [desc(blogs.created_at)],
  })

  return (
    <BlogManagementPage
      blogs={allBlogs}
      initialQuery={q ?? ""}
      initialStatus={(status as "all" | "published" | "draft") ?? "all"}
    />
  )
}