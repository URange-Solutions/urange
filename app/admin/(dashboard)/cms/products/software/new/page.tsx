'use client';

import type React from "react"
import { useState } from "react"
import {
    Mail,
    CalendarClock,
    Handshake,
    ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SingleImageUpload } from "@/components/dashboard/admin/img-upload"
import { TagInput } from "@/components/dashboard/admin/tag-input"
import { MarkdownEditor } from "@/components/dashboard/admin/products/markdown-editor"
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

export default function NewSoftware() {
    const [form, setForm] = useState(EMPTY_SOFTWARE_FORM)
    const router = useRouter();
    function handleSubmit(event: React.FormEvent) {
        event.preventDefault()

    }

    return (
        <div className="flex flex-col gap-6 mx-6 my-6">
            <EditorHeader
                title={"New Software"}
                subtitle="Internal record — configure pricing and links used elsewhere on the site."
            />

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
                    <div className="flex flex-col gap-4">
                        <SingleImageUpload
                            id="sw-icon"
                            label="Icon"
                            value={form.icon}
                            onChange={(value) => setForm((f) => ({ ...f, icon: value }))}
                            previewClassName="size-16"
                            rounded="rounded-xl"
                        />

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="sw-name">Name</Label>
                            <Input
                                id="sw-name"
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                placeholder="e.g. Orbit Enterprise"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="sw-category">Category</Label>
                            <Input
                                id="sw-category"
                                value={form.category}
                                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                                placeholder="e.g. Platform"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="sw-status">Status</Label>
                            <Select value={form.status} onValueChange={(value) => setForm((f) => ({ ...f, status: value as SoftwareStatus }))}>
                                <SelectTrigger id="sw-status" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="coming_soon">Coming soon</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="sw-price">Estimated price</Label>
                            <Input
                                id="sw-price"
                                value={form.estimatedPrice}
                                onChange={(e) => setForm((f) => ({ ...f, estimatedPrice: e.target.value }))}
                                placeholder="e.g. Starting at $2,400/mo"
                            />
                            <p className="text-xs text-muted-foreground">Free text — a number, a range, or "Custom quote" all work.</p>
                        </div>

                        <TagInput id="sw-tags" label="Tags" values={form.tags} onChange={(values) => setForm((f) => ({ ...f, tags: values }))} />
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="sw-description">Short description</Label>
                            <Textarea
                                id="sw-description"
                                value={form.description}
                                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                placeholder="One or two lines shown in the listing table..."
                                rows={2}
                            />
                        </div>

                        <MarkdownEditor
                            id="sw-documentation"
                            label="Documentation"
                            value={form.documentation}
                            onChange={(value) => setForm((f) => ({ ...f, documentation: value }))}
                            placeholder="Document what this software is, what's included, and anything a buyer should know..."
                            rows={12}
                        />

                        <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
                            <div>
                                <p className="text-sm font-medium">Contact &amp; conversion links</p>
                                <p className="text-xs text-muted-foreground">Used by the storefront — not rendered here.</p>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="sw-contact-url" className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Mail className="size-3.5" aria-hidden="true" />
                                    Contact link
                                </Label>
                                <Input
                                    id="sw-contact-url"
                                    value={form.contactUrl}
                                    onChange={(e) => setForm((f) => ({ ...f, contactUrl: e.target.value }))}
                                    placeholder="mailto:sales@urangesys.com"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="sw-demo-url" className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <CalendarClock className="size-3.5" aria-hidden="true" />
                                    Schedule a demo link
                                </Label>
                                <Input
                                    id="sw-demo-url"
                                    type="url"
                                    value={form.demoUrl}
                                    onChange={(e) => setForm((f) => ({ ...f, demoUrl: e.target.value }))}
                                    placeholder="https://cal.com/urangesys/demo"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="sw-purchase-url" className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Handshake className="size-3.5" aria-hidden="true" />
                                    "Make it yours" link
                                </Label>
                                <Input
                                    id="sw-purchase-url"
                                    type="url"
                                    value={form.purchaseUrl}
                                    onChange={(e) => setForm((f) => ({ ...f, purchaseUrl: e.target.value }))}
                                    placeholder="https://urangesys.com/checkout/..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-border pt-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit">{"Create Software"}</Button>
                </div>
            </form>
        </div>
    )
}