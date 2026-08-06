import { db } from "@/database"
import {eq } from "drizzle-orm"
import { blogs } from "@/database/schema"
import { getAdminSession } from "@/lib/auth"
import EditBlog from "./EditBlog"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function BlogWrapper({ params }: PageProps) {
    const session = await getAdminSession()
    if (!session?.admins) return null;

    const { id } = await params;

    const blog = await db.query.blogs.findFirst({
        where: eq(blogs.id, id)
    })

    if (!blog) return null;

    return (
        <EditBlog blogId={blog.id} initialData={{
            title: blog.title,
            tags: blog.tags,
            category: blog.category,
            description: blog.description ?? "",
            content: blog.content,
            status: blog.is_draft ? "hidden" : "live",
            bannerImage: blog.banner_url ?? ""
        }} />
    )
}