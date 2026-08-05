"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { Plus, Search, Pencil, Trash2, FileText, Calendar, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarkdownEditor } from "@/components/dashboard/admin/markdown-editor"

type BlogStatus = "published" | "draft"

type Blog = {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  category: string
  status: BlogStatus
  date: string
  views: number
}

const INITIAL_BLOGS: Blog[] = [
  {
    id: "1",
    title: "Getting Started with UrangeSys",
    excerpt: "A complete walkthrough of setting up your first workspace and inviting your team.",
    content:
      "# Getting Started\n\nWelcome to UrangeSys! This guide walks you through:\n\n- Creating your first **workspace**\n- Inviting teammates\n- Connecting integrations\n\n> Tip: You can invite your whole team at once from Settings.",
    author: "Ava Chen",
    category: "Guides",
    status: "published",
    date: "2026-07-12",
    views: 2410,
  },
  {
    id: "2",
    title: "Designing Scalable Integrations",
    excerpt: "How we approach building integrations that grow with your product needs.",
    content:
      "## Scalable Integrations\n\nOur integration layer is built on three principles:\n\n1. **Idempotency** first\n2. Graceful retries\n3. Observability everywhere\n\nRead more in the `engineering` handbook.",
    author: "Marcus Lee",
    category: "Engineering",
    status: "published",
    date: "2026-06-28",
    views: 1785,
  },
  {
    id: "3",
    title: "The Roadmap for Q3",
    excerpt: "An early look at the features shipping this quarter and what comes next.",
    content: "## Q3 Roadmap\n\nHere's an early look at what's shipping:\n\n- Collaborative editing\n- New analytics dashboard\n- API v2",
    author: "Priya Nair",
    category: "Product",
    status: "draft",
    date: "2026-07-25",
    views: 0,
  },
]

const EMPTY_FORM: Omit<Blog, "id" | "views" | "date"> = {
  title: "",
  excerpt: "",
  content: "",
  author: "",
  category: "",
  status: "draft",
}

export default function BlogManagementPage() {
  const [blogs, setBlogs] = useState<Blog[]>(INITIAL_BLOGS)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | BlogStatus>("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const filtered = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesQuery =
        blog.title.toLowerCase().includes(query.toLowerCase()) ||
        blog.author.toLowerCase().includes(query.toLowerCase()) ||
        blog.category.toLowerCase().includes(query.toLowerCase())
      const matchesStatus = statusFilter === "all" || blog.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [blogs, query, statusFilter])

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setIsModalOpen(true)
  }

  function openEdit(blog: Blog) {
    setEditingId(blog.id)
    setForm({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      author: blog.author,
      category: blog.category,
      status: blog.status,
    })
    setIsModalOpen(true)
  }

  function handleDelete(id: string) {
    setBlogs((prev) => prev.filter((blog) => blog.id !== id))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!form.title.trim()) return

    if (editingId) {
      setBlogs((prev) => prev.map((blog) => (blog.id === editingId ? { ...blog, ...form } : blog)))
    } else {
      setBlogs((prev) => [
        { id: crypto.randomUUID(), views: 0, date: new Date().toISOString().slice(0, 10), ...form },
        ...prev,
      ])
    }
    setIsModalOpen(false)
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <header className="mt-6 mx-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Blog Management</h1>
            <p className="text-muted-foreground">Create, edit, and publish blog posts for UrangeSys.</p>
          </div>
          <Button onClick={openCreate} className="gap-2 self-start sm:self-auto">
            <Plus className="size-4" aria-hidden="true" />
            New Post
          </Button>
        </header>

        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Toolbar */}
          <div className="mx-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts..."
                aria-label="Search posts"
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | BlogStatus)}>
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

          {/* Blog grid */}
          {filtered.length === 0 ? (
            <div className="mx-6 flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
              <FileText className="size-8 text-muted-foreground" aria-hidden="true" />
              <div>
                <p className="font-medium">No posts found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search or create a new post.</p>
              </div>
              <Button variant="outline" onClick={openCreate} className="gap-2">
                <Plus className="size-4" aria-hidden="true" />
                New Post
              </Button>
            </div>
          ) : (
            <div className="mx-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((blog) => (
                <Card key={blog.id} className="flex flex-col">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
                    <Badge variant={blog.status === "published" ? "default" : "secondary"} className="capitalize">
                      {blog.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{blog.category}</span>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <h2 className="font-heading text-lg font-semibold leading-tight text-balance">{blog.title}</h2>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{blog.excerpt}</p>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>{blog.author}</span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="size-3" aria-hidden="true" />
                        {blog.date}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Eye className="size-3" aria-hidden="true" />
                        {blog.views.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="gap-2 border-t border-border">
                    <Button variant="outline" size="sm" onClick={() => openEdit(blog)} className="gap-1.5">
                      <Pencil className="size-3.5" aria-hidden="true" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(blog.id)}
                      className="gap-1.5 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">{editingId ? "Edit Post" : "New Post"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Tabs defaultValue="metadata" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
              </TabsList>

              <TabsContent value="metadata" className="mt-4 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Getting Started with UrangeSys"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={form.excerpt}
                    onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                    placeholder="A short summary shown in the post list..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      value={form.author}
                      onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                      placeholder="e.g. Ava Chen"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      placeholder="e.g. Guides"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 col-span-1">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={form.status}
                      onValueChange={(value) => setForm((f) => ({ ...f, status: value as BlogStatus }))}
                     
                    >
                      <SelectTrigger id="status"  className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="content" className="mt-4 flex flex-col gap-1.5">
                <Label htmlFor="content">Content</Label>
                <MarkdownEditor
                  id="content"
                  value={form.content}
                  onChange={(value) => setForm((f) => ({ ...f, content: value }))}
                  placeholder="Write your post in Markdown. Supports # headings, **bold**, lists, > quotes, and `code`."
                />
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingId ? "Save Changes" : "Create Post"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
