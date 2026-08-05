'use client';

import type React from "react"
import { useMemo, useState } from "react"
import {
    Plus,
    Pencil,
    Trash2,
    ImageIcon,
    Mail,
    CalendarClock,
    Handshake,
    Tag,
    FileText,
    ArrowLeft,
    Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SingleImageUpload } from "@/components/dashboard/admin/img-upload"
import { TagInput } from "@/components/dashboard/admin/tag-input"
import { MarkdownEditor } from "@/components/dashboard/admin/products/markdown-editor"
import { EmptyState } from "@/components/dashboard/admin/products/empty-state"
import { ProductsLayout } from "@/layouts/products-tabs-layout";
import { useRouter } from "next/navigation";

type SoftwareStatus = "available" | "coming_soon" | "draft"

type SoftwareItem = {
    id: string
    name: string
    description: string
    documentation: string
    category: string
    estimatedPrice: string
    status: SoftwareStatus
    icon: string
    tags: string[]
    contactUrl: string
    demoUrl: string
    purchaseUrl: string
}

const INITIAL_SOFTWARE: SoftwareItem[] = [
    {
        id: "sw1",
        name: "Orbit Enterprise",
        description: "The full Orbit platform, self-hosted or dedicated-tenant, with SSO and custom SLAs.",
        documentation:
            "## Overview\nOrbit Enterprise is a dedicated deployment of the Orbit platform — self-hosted or single-tenant — for organizations that need custom SLAs and SSO.\n\n## Includes\n- Dedicated infrastructure or self-hosted install\n- SAML/OIDC single sign-on\n- 24/7 support with a named account manager\n\n## Good fit for\nCompanies with 200+ seats or strict data-residency requirements.",
        category: "Platform",
        estimatedPrice: "Starting at $2,400/mo",
        status: "available",
        icon: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&q=80",
        tags: ["Enterprise", "Self-hosted"],
        contactUrl: "mailto:sales@urangesys.com",
        demoUrl: "https://cal.com/urangesys/demo",
        purchaseUrl: "https://urangesys.com/enterprise/start",
    },
    {
        id: "sw2",
        name: "Fieldwork OS",
        description: "Device management and provisioning software for fleets of Fieldwork hardware.",
        documentation:
            "## Overview\nFieldwork OS manages provisioning, updates, and monitoring for fleets of Fieldwork devices from a single console.\n\n## Includes\n- Zero-touch provisioning\n- Fleet-wide OTA updates\n- Health monitoring and alerting",
        category: "Operations",
        estimatedPrice: "$18 / device / mo",
        status: "available",
        icon: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80",
        tags: ["Field Ops", "IoT"],
        contactUrl: "mailto:sales@urangesys.com",
        demoUrl: "https://cal.com/urangesys/fieldwork-demo",
        purchaseUrl: "https://urangesys.com/fieldwork/start",
    },
    {
        id: "sw3",
        name: "Pulse Forecasting Engine",
        description: "Standalone anomaly detection and forecasting engine, deployable via API or on-prem.",
        documentation: "",
        category: "Analytics",
        estimatedPrice: "Custom quote",
        status: "coming_soon",
        icon: "",
        tags: ["Analytics", "API"],
        contactUrl: "mailto:sales@urangesys.com",
        demoUrl: "",
        purchaseUrl: "",
    },
]

const EMPTY_SOFTWARE_FORM: Omit<SoftwareItem, "id"> = {
    name: "",
    description: "",
    documentation: "",
    category: "",
    estimatedPrice: "",
    status: "draft",
    icon: "",
    tags: [],
    contactUrl: "",
    demoUrl: "",
    purchaseUrl: "",
}

const SOFTWARE_STATUS_LABEL: Record<SoftwareStatus, string> = {
    available: "Available",
    coming_soon: "Coming soon",
    draft: "Draft",
}

const SOFTWARE_STATUS_VARIANT: Record<SoftwareStatus, "default" | "secondary"> = {
    available: "default",
    coming_soon: "secondary",
    draft: "secondary",
}

function EditorHeader({ title, subtitle, onBack }: { title: string; subtitle: string; onBack: () => void }) {
    return (
        <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="icon" onClick={onBack} aria-label="Back to list" className="shrink-0">
                <ArrowLeft className="size-4" aria-hidden="true" />
            </Button>
            <div>
                <h2 className="font-heading text-lg font-semibold">{title}</h2>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
        </div>
    )
}

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

export default function SoftwareTab() {
    const [items, setItems] = useState<SoftwareItem[]>(INITIAL_SOFTWARE)
    const [query, setQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<"all" | SoftwareStatus>("all")

    const filtered = useMemo(() => {
        return items.filter((item) => {
            const q = query.toLowerCase()
            const matchesQuery =
                item.name.toLowerCase().includes(q) ||
                item.category.toLowerCase().includes(q) ||
                item.tags.some((tag) => tag.toLowerCase().includes(q))
            const matchesStatus = statusFilter === "all" || item.status === statusFilter
            return matchesQuery && matchesStatus
        })
    }, [items, query, statusFilter])

    const router = useRouter();

    function handleDelete(id: string) {
        setItems((prev) => prev.filter((item) => item.id !== id))
    }


    return (
        <ProductsLayout>
            <div className="flex flex-col gap-4">
                <Toolbar
                    query={query}
                    onQueryChange={setQuery}
                    placeholder="Search software..."
                    right={
                        <div className="flex items-center gap-2">
                            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | SoftwareStatus)}>
                                <SelectTrigger className="w-full sm:w-40" aria-label="Filter by status">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All software</SelectItem>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="coming_soon">Coming soon</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={() => router.push('/admin/cms/products/software/new')} className="gap-2 self-start sm:self-auto">
                                <Plus className="size-4" aria-hidden="true" />
                                New Software
                            </Button>
                        </div>
                    }
                />

                {filtered.length === 0 ? (
                    <EmptyState label="software listings" onCreate={() => router.push('/admin/cms/products/software/new')} />
                ) : (
                    <Card className="overflow-hidden py-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-14"></TableHead>
                                    <TableHead>Software</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Docs</TableHead>
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
                                                {item.tags.length > 0 && (
                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                        {item.tags.slice(0, 2).map((tag) => (
                                                            <Badge key={tag} variant="outline" className="font-normal">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{item.category || "—"}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                                {item.estimatedPrice || "—"}
                                            </span>
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
                                            <Badge variant={SOFTWARE_STATUS_VARIANT[item.status]}>{SOFTWARE_STATUS_LABEL[item.status]}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1.5">
                                                <Button variant="outline" size="sm" onClick={() => router.push(`/admin/cms/products/software/edit/${item.id}`)} className="gap-1.5">
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