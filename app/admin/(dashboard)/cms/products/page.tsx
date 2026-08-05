'use client';

import type React from "react"
import { useMemo, useState } from "react"
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Eye,
    EyeOff,
    ImageOff,
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { EmptyState } from "../../../../../components/dashboard/admin/products/empty-state"
import { ProductsLayout } from "@/layouts/products-tabs-layout";
import { useRouter } from "next/navigation";

type ShowcaseStatus = "live" | "hidden"

type ShowcaseItem = {
    id: string
    title: string
    tagline: string
    description: string
    documentation: string
    order: number
    status: ShowcaseStatus
    bannerImage: string
}

const INITIAL_SHOWCASE: ShowcaseItem[] = [
    {
        id: "s1",
        title: "UrangeSys Orbit",
        tagline: "One control plane for every workspace.",
        description: "Orbit brings your teams, integrations, and analytics into a single real-time view.",
        documentation:
            "## What it is\nOrbit is the central dashboard that ties every UrangeSys product together — teams, integrations, and analytics in one real-time view.\n\n## Highlights\n- Live activity feed across every connected workspace\n- Role-based access with SSO\n- Built-in anomaly alerts powered by Pulse\n\n## Related\nPairs well with **Fieldwork Kit** for teams that also manage hardware in the field.",
        order: 1,
        status: "live",
        bannerImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    },
    {
        id: "s2",
        title: "Fieldwork Kit",
        tagline: "Hardware + software, provisioned in minutes.",
        description: "Pair any Fieldwork device with your workspace and it shows up ready to use, no manual setup.",
        documentation:
            "## What it is\nA zero-config pairing flow for Fieldwork hardware. Devices register themselves to the right workspace the moment they're powered on.\n\n## Notes\n- Ships with the Fieldwork OS agent preinstalled\n- No manual IP or token entry required",
        order: 2,
        status: "live",
        bannerImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    },
    {
        id: "s3",
        title: "Pulse Analytics",
        tagline: "See what's changing before it's a problem.",
        description: "Anomaly detection and forecasting built directly into every dashboard.",
        documentation: "",
        order: 3,
        status: "hidden",
        bannerImage: "",
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

export default function ShowcaseTab() {
    const [items, setItems] = useState<ShowcaseItem[]>(INITIAL_SHOWCASE)
    const [query, setQuery] = useState("");

    const router = useRouter();

    const filtered = useMemo(() => {
        return [...items]
            .sort((a, b) => a.order - b.order)
            .filter(
                (item) =>
                    item.title.toLowerCase().includes(query.toLowerCase()) ||
                    item.tagline.toLowerCase().includes(query.toLowerCase()),
            )
    }, [items, query])

    function handleDelete(id: string) {
        setItems((prev) => prev.filter((item) => item.id !== id))
    }

    function moveItem(id: string, direction: -1 | 1) {
        setItems((prev) => {
            const sorted = [...prev].sort((a, b) => a.order - b.order)
            const index = sorted.findIndex((item) => item.id === id)
            const swapIndex = index + direction
            if (swapIndex < 0 || swapIndex >= sorted.length) return prev
            const a = sorted[index]
            const b = sorted[swapIndex]
            return prev.map((item) => {
                if (item.id === a.id) return { ...item, order: b.order }
                if (item.id === b.id) return { ...item, order: a.order }
                return item
            })
        })
    }

    return (
        <ProductsLayout>
            <div className="flex flex-col gap-4">
                <Toolbar
                    query={query}
                    onQueryChange={setQuery}
                    placeholder="Search showcase..."
                    right={
                        <Button onClick={() => router.push('/admin/cms/products/new')} className="gap-2 self-start sm:self-auto">
                            <Plus className="size-4" aria-hidden="true" />
                            New Highlight
                        </Button>
                    }
                />

                {filtered.length === 0 ? (
                    <EmptyState label="highlights" onCreate={() => router.push('/admin/cms/products/new')} />
                ) : (
                    <Card className="overflow-hidden py-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16"></TableHead>
                                    <TableHead className="w-14"></TableHead>
                                    <TableHead>Highlight</TableHead>
                                    <TableHead>Docs</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((item, index) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-0.5">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label="Move up"
                                                    onClick={() => moveItem(item.id, -1)}
                                                    disabled={index === 0}
                                                    className="size-7"
                                                >
                                                    <ArrowUp className="size-3.5" aria-hidden="true" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label="Move down"
                                                    onClick={() => moveItem(item.id, 1)}
                                                    disabled={index === filtered.length - 1}
                                                    className="size-7"
                                                >
                                                    <ArrowDown className="size-3.5" aria-hidden="true" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex size-10 items-center justify-center overflow-hidden rounded-md bg-muted">
                                                {item.bannerImage ? (
                                                    <img src={item.bannerImage} alt="" className="size-full object-cover" />
                                                ) : (
                                                    <ImageOff className="size-4 text-muted-foreground" aria-hidden="true" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{item.title}</span>
                                                <span className="line-clamp-1 text-xs text-muted-foreground">{item.tagline}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {item.documentation.trim() ? (
                                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                    <FileText className="size-3" aria-hidden="true" />
                                                    Documented
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={item.status === "live" ? "default" : "secondary"} className="gap-1 capitalize">
                                                {item.status === "live" ? (
                                                    <Eye className="size-3" aria-hidden="true" />
                                                ) : (
                                                    <EyeOff className="size-3" aria-hidden="true" />
                                                )}
                                                {item.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1.5">
                                                <Button variant="outline" size="sm" onClick={() => router.push(`/admin/cms/products/edit/${item.id}`)} className="gap-1.5">
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
            </div>
        </ProductsLayout>
    )
}
