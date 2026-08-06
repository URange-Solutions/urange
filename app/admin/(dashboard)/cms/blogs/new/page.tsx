'use client';

import type React from "react"
import { useState } from "react"
import {
    ArrowLeft,
    Loader2,
    Plus,
    X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SingleImageUpload } from "@/components/dashboard/admin/img-upload"
import { MarkdownEditor } from "@/components/dashboard/admin/products/markdown-editor"
import { useRouter } from "next/navigation";
import { createBlog, updateBlog } from "@/actions/blogs";

type BlogStatus = "live" | "hidden"

type BlogItem = {
    id: string
    title: string
    tags: string[]
    category: string
    description: string
    documentation: string
    order: number
    status: BlogStatus
    bannerImage: string
}

type BlogFormValues = Omit<BlogItem, "id" | "order">

const EMPTY_BLOG_FORM: BlogFormValues = {
    title: "",
    tags: [],
    category: "",
    description: "",
    documentation: "",
    status: "hidden",
    bannerImage: "",
}

function EditorHeader({ title, subtitle }: { title: string; subtitle: string; }) {
    const router = useRouter();
    return (
        <div className="flex items-center gap-3">
            <Button onClick={() => router.back()} type="button" variant="ghost" size="icon" aria-label="Back to list" className="shrink-0">
                <ArrowLeft className="size-4" aria-hidden="true" />
            </Button>
            <div>
                <h2 className="font-heading text-lg font-semibold">{title}</h2>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
        </div>
    )
}

function TagsInput({
    value,
    onChange,
}: {
    value: string[]
    onChange: (tags: string[]) => void
}) {
    const [draft, setDraft] = useState("")

    function addTag() {
        const trimmed = draft.trim()
        if (!trimmed) return
        if (value.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
            setDraft("")
            return
        }
        onChange([...value, trimmed])
        setDraft("")
    }

    function removeTag(tag: string) {
        onChange(value.filter((t) => t !== tag))
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            addTag()
        } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
            removeTag(value[value.length - 1])
        }
    }

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex gap-2">
                <Input
                    id="sc-tags"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add a tag and press Enter"
                />
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Add tag"
                    onClick={addTag}
                    className="shrink-0"
                >
                    <Plus className="size-4" aria-hidden="true" />
                </Button>
            </div>

            {value.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {value.map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                aria-label={`Remove tag ${tag}`}
                                className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <X className="size-3" aria-hidden="true" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function NewBlog({
    blogId,
    initialData,
}: {
    /** Pass the blog's id to edit an existing post instead of creating a new one. */
    blogId?: string
    initialData?: Partial<BlogFormValues>
}) {
    const [form, setForm] = useState<BlogFormValues>({
        ...EMPTY_BLOG_FORM,
        ...initialData,
    });
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter();
    const isEditing = Boolean(blogId)

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()
        setError(null)

        if (!form.title.trim()) {
            setError("Title is required")
            return
        }
        if (!form.category.trim()) {
            setError("Category is required")
            return
        }

        setIsSubmitting(true)
        try {
            const result = isEditing
                ? await updateBlog({
                      id: blogId!,
                      title: form.title,
                      category: form.category,
                      tags: form.tags,
                      description: form.description,
                      bannerUrl: form.bannerImage,
                      isDraft: form.status === "hidden",
                  })
                : await createBlog({
                      title: form.title,
                      category: form.category,
                      tags: form.tags,
                      description: form.description,
                      bannerUrl: form.bannerImage,
                      isDraft: form.status === "hidden",
                  })

            if (!result.success) {
                setError(result.error)
                return
            }

            router.push("/admin/blogs") // adjust to your actual blogs list route
            router.refresh()
        } catch (err) {
            console.error("Failed to publish blog:", err)
            setError("Something went wrong. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col gap-6 mx-6 mt-6">
            <EditorHeader
                title={isEditing ? "Edit Blog" : "New Blog"}
                subtitle="Create, edit, and publish blog posts for URange."
            />

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
                    <div className="flex flex-col gap-4">
                        <SingleImageUpload
                            id="sc-banner"
                            label="Blog Banner"
                            value={form.bannerImage}
                            onChange={(value) => setForm((f) => ({ ...f, bannerImage: value }))}
                            previewClassName="aspect-video w-full"
                        />

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="sc-title">Title</Label>
                            <Input
                                id="sc-title"
                                value={form.title}
                                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                placeholder="e.g. Getting Started with URange"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="sc-category">Category</Label>
                            <Input
                                id="sc-category"
                                value={form.category}
                                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                                placeholder="e.g. Product Updates"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="sc-tags">Tags</Label>
                            <TagsInput
                                value={form.tags}
                                onChange={(tags) => setForm((f) => ({ ...f, tags }))}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="sc-description">Short description</Label>
                            <Textarea
                                id="sc-description"
                                value={form.description}
                                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                placeholder="A short paragraph shown when this highlight is expanded..."
                                rows={3}
                            />
                        </div>

                        <MarkdownEditor
                            id="sc-documentation"
                            label="Content"
                            value={form.documentation}
                            onChange={(value) => setForm((f) => ({ ...f, documentation: value }))}
                            placeholder="Document what this highlight is, key features, and anything related — this replaces linking out to a separate blog post."
                            rows={10}
                        />
                    </div>
                </div>

                {error && (
                    <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                    </p>
                )}

                <div className="flex justify-end gap-2 border-t border-border pt-4">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />}
                        {isSubmitting ? "Publishing..." : "Publish Blog"}
                    </Button>
                </div>
            </form>
        </div>
    )
}