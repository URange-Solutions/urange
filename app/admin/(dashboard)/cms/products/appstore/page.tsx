'use client';

import type React from "react"
import { useMemo, useState } from "react"
import {
    Plus,
    Search,
    Pencil,
    Store,
    Download,
    ImageIcon,
    Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MultiImageUpload, SingleImageUpload } from "@/components/dashboard/admin/img-upload"
import { TagInput } from "@/components/dashboard/admin/tag-input"
import { EmptyState } from "@/components/dashboard/admin/products/empty-state"
import { ProductsLayout } from "@/layouts/products-tabs-layout";

type AppStatus = "listed" | "draft"

type AppItem = {
    id: string
    name: string
    description: string
    developer: string
    category: string
    status: AppStatus
    icon: string
    downloadUrl: string
    tags: string[]
    previewImages: string[]
}

const INITIAL_APPS: AppItem[] = [
    {
        id: "a1",
        name: "Inbox Router",
        description: "Automatically triages incoming support requests by topic and urgency.",
        developer: "UrangeSys Labs",
        category: "Productivity",
        status: "listed",
        icon: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=200&q=80",
        downloadUrl: "https://cdn.urangesys.com/apps/inbox-router-1.4.0.apk",
        tags: ["Automation", "Support"],
        previewImages: [
            "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&q=80",
            "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=600&q=80",
        ],
    },
    {
        id: "a2",
        name: "Ledger Sync",
        description: "Two-way sync between Orbit and your accounting software.",
        developer: "Third Rail Software",
        category: "Finance",
        status: "listed",
        icon: "https://images.unsplash.com/photo-1618044733300-9472054094ee?w=200&q=80",
        downloadUrl: "https://cdn.urangesys.com/apps/ledger-sync-2.1.0.apk",
        tags: ["Finance", "Sync"],
        previewImages: ["https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80"],
    },
    {
        id: "a3",
        name: "Field Notes",
        description: "Voice-to-text logging for on-site technicians, synced to Orbit.",
        developer: "UrangeSys Labs",
        category: "Field Ops",
        status: "draft",
        icon: "",
        downloadUrl: "",
        tags: ["Field Ops", "Voice"],
        previewImages: [],
    },
]

function Toolbar({
    query,
    onQueryChange,
    placeholder,
    right,
}: {
    query: string
    onQueryChange: (v: string) => void
    placeholder: string
    right?: React.ReactNode
}) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                    type="search"
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    placeholder={placeholder}
                    aria-label={placeholder}
                    className="pl-9"
                />
            </div>
            {right}
        </div>
    )
}

const EMPTY_APP_FORM: Omit<AppItem, "id"> = {
    name: "",
    description: "",
    developer: "",
    category: "",
    status: "draft",
    icon: "",
    downloadUrl: "",
    tags: [],
    previewImages: [],
}

export default function AppStoreTab() {
    const [items, setItems] = useState<AppItem[]>(INITIAL_APPS)
    const [query, setQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<"all" | AppStatus>("all")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState(EMPTY_APP_FORM)

    const filtered = useMemo(() => {
        return items.filter((item) => {
            const q = query.toLowerCase()
            const matchesQuery =
                item.name.toLowerCase().includes(q) ||
                item.developer.toLowerCase().includes(q) ||
                item.category.toLowerCase().includes(q) ||
                item.tags.some((tag) => tag.toLowerCase().includes(q))
            const matchesStatus = statusFilter === "all" || item.status === statusFilter
            return matchesQuery && matchesStatus
        })
    }, [items, query, statusFilter])

    function openCreate() {
        setEditingId(null)
        setForm(EMPTY_APP_FORM)
        setIsModalOpen(true)
    }

    function openEdit(item: AppItem) {
        setEditingId(item.id)
        setForm({
            name: item.name,
            description: item.description,
            developer: item.developer,
            category: item.category,
            status: item.status,
            icon: item.icon,
            downloadUrl: item.downloadUrl,
            tags: item.tags,
            previewImages: item.previewImages,
        })
        setIsModalOpen(true)
    }

    function handleDelete(id: string) {
        setItems((prev) => prev.filter((item) => item.id !== id))
    }

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault()
        if (!form.name.trim()) return

        if (editingId) {
            setItems((prev) => prev.map((item) => (item.id === editingId ? { ...item, ...form } : item)))
        } else {
            setItems((prev) => [{ id: crypto.randomUUID(), ...form }, ...prev])
        }
        setIsModalOpen(false)
    }

    return (
        <ProductsLayout>
            <div className="flex flex-col gap-4">
                <Toolbar
                    query={query}
                    onQueryChange={setQuery}
                    placeholder="Search apps..."
                    right={
                        <div className="flex items-center gap-2">
                            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | AppStatus)}>
                                <SelectTrigger className="w-full sm:w-40" aria-label="Filter by status">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All apps</SelectItem>
                                    <SelectItem value="listed">Listed</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={openCreate} className="gap-2 self-start sm:self-auto">
                                <Plus className="size-4" aria-hidden="true" />
                                New App
                            </Button>
                        </div>
                    }
                />

                {filtered.length === 0 ? (
                    <EmptyState label="apps" onCreate={openCreate} />
                ) : (
                    <Card className="overflow-hidden py-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-14"></TableHead>
                                    <TableHead>App</TableHead>
                                    <TableHead>Developer</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Tags</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="flex size-10 items-center justify-center overflow-hidden rounded-lg bg-muted">
                                                {item.icon ? (
                                                    <img src={item.icon} alt="" className="size-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{item.name}</span>
                                                <span className="line-clamp-1 text-xs text-muted-foreground">{item.description}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                                <Store className="size-3" aria-hidden="true" />
                                                {item.developer || "—"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{item.category || "—"}</TableCell>
                                        <TableCell>
                                            {item.tags.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {item.tags.slice(0, 2).map((tag) => (
                                                        <Badge key={tag} variant="outline" className="font-normal">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                    {item.tags.length > 2 && (
                                                        <Badge variant="outline" className="font-normal text-muted-foreground">
                                                            +{item.tags.length - 2}
                                                        </Badge>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={item.status === "listed" ? "default" : "secondary"} className="capitalize">
                                                {item.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1.5">
                                                {item.downloadUrl && (
                                                    <Button variant="ghost" size="icon" asChild className="size-8">
                                                        <a href={item.downloadUrl} target="_blank" rel="noreferrer" aria-label="Download APK">
                                                            <Download className="size-3.5" aria-hidden="true" />
                                                        </a>
                                                    </Button>
                                                )}
                                                <Button variant="outline" size="sm" onClick={() => openEdit(item)} className="gap-1.5">
                                                    <Pencil className="size-3.5" aria-hidden="true" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(item.id)}
                                                    className="gap-1.5 text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="size-3.5" aria-hidden="true" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                )}

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="font-heading">{editingId ? "Edit App" : "New App"}</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <SingleImageUpload
                                id="app-icon"
                                label="App icon"
                                value={form.icon}
                                onChange={(value) => setForm((f) => ({ ...f, icon: value }))}
                                previewClassName="size-16"
                                rounded="rounded-xl"
                            />

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="app-name">Name</Label>
                                    <Input
                                        id="app-name"
                                        value={form.name}
                                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                        placeholder="e.g. Inbox Router"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="app-developer">Developer</Label>
                                    <Input
                                        id="app-developer"
                                        value={form.developer}
                                        onChange={(e) => setForm((f) => ({ ...f, developer: e.target.value }))}
                                        placeholder="e.g. UrangeSys Labs"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="app-description">Description</Label>
                                <Textarea
                                    id="app-description"
                                    value={form.description}
                                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                    placeholder="What this app does..."
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="app-category">Category</Label>
                                    <Input
                                        id="app-category"
                                        value={form.category}
                                        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                                        placeholder="e.g. Productivity"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="app-status">Status</Label>
                                    <Select value={form.status} onValueChange={(value) => setForm((f) => ({ ...f, status: value as AppStatus }))}>
                                        <SelectTrigger id="app-status" className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="listed">Listed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <TagInput id="app-tags" label="Tags" values={form.tags} onChange={(values) => setForm((f) => ({ ...f, tags: values }))} />

                            <MultiImageUpload
                                id="app-preview-images"
                                label="Preview images"
                                values={form.previewImages}
                                onChange={(values) => setForm((f) => ({ ...f, previewImages: values }))}
                                thumbnailClassName="aspect-[9/16] h-24 w-auto"
                            />

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="app-download-url">Download URL (APK)</Label>
                                <Input
                                    id="app-download-url"
                                    type="url"
                                    value={form.downloadUrl}
                                    onChange={(e) => setForm((f) => ({ ...f, downloadUrl: e.target.value }))}
                                    placeholder="https://cdn.example.com/app.apk"
                                />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">{editingId ? "Save Changes" : "Add App"}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </ProductsLayout>
    )
}

