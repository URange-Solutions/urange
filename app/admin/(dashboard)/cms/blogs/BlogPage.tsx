"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { Plus, Search, Pencil, Trash2, FileText, Calendar, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useRouter, usePathname } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { deleteBlog } from "@/actions/blogs"
import { DeleteConfirmDialog } from "@/components/modals/DeleteConfirmModal"

type BlogRow = {
    id: string
    created_at: string | null
    description: string | null
    author_id: string
    slug: string
    category: string
    tags: string[]
    is_draft: boolean | null
    title: string
    banner_url: string | null
    updated_at: string | null
}

type StatusFilter = "all" | "published" | "draft"

interface BlogManagementPageProps {
    blogs: BlogRow[]
    initialQuery: string
    initialStatus: StatusFilter
}

export default function BlogManagementPage({
    blogs,
    initialQuery,
    initialStatus,
}: BlogManagementPageProps) {
    const [query, setQuery] = useState(initialQuery)
    const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus)
    const [isPending, startTransition] = useTransition()
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<BlogRow | null>(null)

    const router = useRouter()
    const pathname = usePathname()
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    function pushParams(nextQuery: string, nextStatus: StatusFilter) {
        const params = new URLSearchParams()
        if (nextQuery) params.set("q", nextQuery)
        if (nextStatus !== "all") params.set("status", nextStatus)

        startTransition(() => {
            router.push(`${pathname}${params.toString() ? `?${params}` : ""}`)
        })
    }

    function handleQueryChange(value: string) {
        setQuery(value)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            pushParams(value, statusFilter)
        }, 350)
    }

    function handleStatusChange(value: StatusFilter) {
        setStatusFilter(value)
        pushParams(query, value)
    }

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [])

    function requestDelete(blog: BlogRow) {
        setDeleteTarget(blog)
    }

    function confirmDelete() {
        if (!deleteTarget) return
        const id = deleteTarget.id
        setPendingDeleteId(id)
        startTransition(async () => {
            try {
                await deleteBlog(id)
                setDeleteTarget(null)
            } catch (err) {
                console.error("Failed to delete blog:", err)
            } finally {
                setPendingDeleteId(null)
            }
        })
    }

    function formatDate(value: string | null) {
        if (!value) return "—"
        return new Date(value).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <header className="mt-6 mx-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="font-heading text-2xl font-bold">Blog Management</h1>
                        <p className="text-muted-foreground">Create, edit, and publish blog posts for UrangeSys.</p>
                    </div>
                    <Button onClick={() => router.push("/admin/cms/blogs/new")} className="gap-2 self-start sm:self-auto">
                        <Plus className="size-4" aria-hidden="true" />
                        New Post
                    </Button>
                </header>

                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <div className="mx-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full sm:max-w-xs">
                            <Search
                                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                                aria-hidden="true"
                            />
                            <Input
                                type="search"
                                value={query}
                                onChange={(e) => handleQueryChange(e.target.value)}
                                placeholder="Search posts..."
                                aria-label="Search posts"
                                className="pl-9"
                            />
                        </div>

                        <Select value={statusFilter} onValueChange={(value) => handleStatusChange(value as StatusFilter)}>
                            <SelectTrigger className="w-full sm:w-40" aria-label="Filter by status">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All posts</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {blogs.length === 0 ? (
                        <div className="mx-6 flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
                            <FileText className="size-8 text-muted-foreground" aria-hidden="true" />
                            <div>
                                <p className="font-medium">No posts found</p>
                                <p className="text-sm text-muted-foreground">Try adjusting your search or create a new post.</p>
                            </div>
                            <Button variant="outline" onClick={() => router.push("/admin/cms/blogs/new")} className="gap-2">
                                <Plus className="size-4" aria-hidden="true" />
                                New Post
                            </Button>
                        </div>
                    ) : (
                        <div
                            className={`mx-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 transition-opacity ${isPending ? "opacity-60" : "opacity-100"
                                }`}
                        >
                            {blogs.map((blog) => {
                                const status: "published" | "draft" = blog.is_draft ? "draft" : "published"
                                const isDeleting = isPending && pendingDeleteId === blog.id

                                return (
                                    <Card key={blog.id} className="flex flex-col overflow-hidden py-0 gap-0">
                                        {blog.banner_url && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={blog.banner_url} alt="" className="h-28 w-full object-cover" />
                                        )}

                                        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 px-4 pt-3 pb-0">
                                            <Badge variant={status === "published" ? "default" : "secondary"} className="capitalize">
                                                {status}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">{blog.category}</span>
                                        </CardHeader>

                                        <CardContent className="flex flex-1 flex-col gap-2 px-4 py-3">
                                            <div className="flex flex-col gap-0.5">
                                                <h2 className="font-heading text-base font-semibold leading-tight text-balance line-clamp-1">
                                                    {blog.title}
                                                </h2>
                                                {blog.description && (
                                                    <p className="line-clamp-2 text-sm text-muted-foreground">{blog.description}</p>
                                                )}
                                            </div>

                                            {blog.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {blog.tags.slice(0, 3).map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                                                        >
                                                            <Tag className="size-3" aria-hidden="true" />
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>

                                        <CardFooter className="flex items-center justify-between gap-2 border-t border-border px-4 pt-2 pb-4.5">
                                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                <Calendar className="size-3" aria-hidden="true" />
                                                {formatDate(blog.updated_at ?? blog.created_at)}
                                            </span>

                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push(`/admin/cms/blogs/edit/${blog.id}`)}
                                                    className="gap-1.5"
                                                >
                                                    <Pencil className="size-3.5" aria-hidden="true" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={isPending && pendingDeleteId === blog.id}
                                                    onClick={() => requestDelete(blog)}
                                                    className="gap-1.5 text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="size-3.5" aria-hidden="true" />
                                                    {isDeleting ? "Deleting…" : "Delete"}
                                                </Button>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            <DeleteConfirmDialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => {
                    if (!open) setDeleteTarget(null)
                }}
                onConfirm={confirmDelete}
                title="Delete post"
                itemName={deleteTarget?.title}
                isLoading={isPending && pendingDeleteId === deleteTarget?.id}
            />
        </div>
    )
}