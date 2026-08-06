"use server";

import { db } from "@/database";
import { blogs } from "@/database/schema";
import { getAdminSession } from "@/lib/auth";
import { eq, ne, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function getCurrentAdminId(): Promise<string> {
  throw new Error("getCurrentAdminId() is not implemented — wire this up to your auth solution");
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugify(title) || "post";
  let slug = base;
  let suffix = 1;

  while (true) {
    const conflictCondition = excludeId
      ? and(eq(blogs.slug, slug), ne(blogs.id, excludeId))
      : eq(blogs.slug, slug);

    const existing = await db.select({ id: blogs.id }).from(blogs).where(conflictCondition).limit(1);

    if (existing.length === 0) return slug;

    suffix += 1;
    slug = `${base}-${suffix}`;
  }
}

export type CreateBlogInput = {
  title: string;
  category: string;
  tags?: string[];
  description?: string;
  bannerUrl?: string;
  isDraft?: boolean;
};

export async function createBlog(input: CreateBlogInput) {
  if (!input.title?.trim()) {
    return { success: false as const, error: "Title is required" };
  }
  if (!input.category?.trim()) {
    return { success: false as const, error: "Category is required" };
  }

  try {
    const session = await getAdminSession();

    if (!session?.admins) return { success: false as const, error: "Failed to create blog. Your'e not authenticated." };
    const slug = await generateUniqueSlug(input.title);

    const [created] = await db
      .insert(blogs)
      .values({
        author_id: session.admins.id,
        slug,
        category: input.category,
        tags: input.tags ?? [],
        title: input.title,
        description: input.description ?? null,
        banner_url: input.bannerUrl ?? null,
        is_draft: input.isDraft ?? true,
      })
      .returning();

    revalidatePath("/admin/cms/blogs");

    return { success: true as const, data: created };
  } catch (err) {
    console.error("createBlog error:", err);
    return { success: false as const, error: "Failed to create blog. The category may already be in use." };
  }
}

export type UpdateBlogInput = {
  id: string;
  title?: string;
  category?: string;
  tags?: string[];
  description?: string;
  bannerUrl?: string;
  isDraft?: boolean;
};

export async function updateBlog(input: UpdateBlogInput) {
  if (!input.id) {
    return { success: false as const, error: "Blog id is required" };
  }

  try {

    const session = await getAdminSession();

    if (!session?.admins) return { success: false as const, error: "Failed to create blog. Your'e not authenticated." };

    const updateValues: Partial<typeof blogs.$inferInsert> = {
      updated_at: new Date().toISOString(),
    };

    if (input.category !== undefined) updateValues.category = input.category;
    if (input.tags !== undefined) updateValues.tags = input.tags;
    if (input.description !== undefined) updateValues.description = input.description;
    if (input.bannerUrl !== undefined) updateValues.banner_url = input.bannerUrl;
    if (input.isDraft !== undefined) updateValues.is_draft = input.isDraft;

    if (input.title !== undefined) {
      updateValues.title = input.title;
      updateValues.slug = await generateUniqueSlug(input.title, input.id);
    }

    const [updated] = await db
      .update(blogs)
      .set(updateValues)
      .where(and(eq(blogs.id, input.id), eq(blogs.author_id, session.admins.id)))
      .returning();

    if (!updated) {
      return { success: false as const, error: "Blog not found or you don't have permission to edit it" };
    }

    revalidatePath("/admin/cms/blogs");
    revalidatePath(`/admin/cms/blogs/${input.id}`);

    return { success: true as const, data: updated };
  } catch (err) {
    console.error("updateBlog error:", err);
    return { success: false as const, error: "Failed to update blog. The category may already be in use." };
  }
}

export async function deleteBlog(id: string) {
  if (!id) {
    return { success: false as const, error: "Blog id is required" };
  }

  try {
    const session = await getAdminSession();

    if (!session?.admins) return { success: false as const, error: "Failed to create blog. Your'e not authenticated." };

    const [deleted] = await db
      .delete(blogs)
      .where(and(eq(blogs.id, id), eq(blogs.author_id, session.admins.id)))
      .returning();

    if (!deleted) {
      return { success: false as const, error: "Blog not found or you don't have permission to delete it" };
    }

    revalidatePath("/admin/cms/blogs");

    return { success: true as const, data: deleted };
  } catch (err) {
    console.error("deleteBlog error:", err);
    return { success: false as const, error: "Failed to delete blog" };
  }
}