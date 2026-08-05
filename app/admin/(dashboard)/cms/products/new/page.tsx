'use client';

import type React from "react"
import { useState } from "react"
import {
    ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SingleImageUpload } from "@/components/dashboard/admin/img-upload"
import { MarkdownEditor } from "@/components/dashboard/admin/products/markdown-editor"
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

const EMPTY_SHOWCASE_FORM: Omit<ShowcaseItem, "id" | "order"> = {
    title: "",
    tagline: "",
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


export default function NewShowcase() {
    const [form, setForm] = useState(EMPTY_SHOWCASE_FORM);
    const router = useRouter();
    function handleSubmit(event: React.FormEvent) {
        event.preventDefault()

    }

    return (
        <div className="flex flex-col gap-6 mx-6 mt-6">
            <EditorHeader
                title={"New Highlight"}
                subtitle="Shown on the homepage showcase."
            />

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
                    <div className="flex flex-col gap-4">
                        <SingleImageUpload
                            id="sc-banner"
                            label="Banner image"
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
                                placeholder="e.g. UrangeSys Orbit"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="sc-tagline">Tagline</Label>
                            <Input
                                id="sc-tagline"
                                value={form.tagline}
                                onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                                placeholder="One line shown on the hero"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="sc-status">Status</Label>
                            <Select value={form.status} onValueChange={(value) => setForm((f) => ({ ...f, status: value as ShowcaseStatus }))}>
                                <SelectTrigger id="sc-status" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="live">Live</SelectItem>
                                    <SelectItem value="hidden">Hidden</SelectItem>
                                </SelectContent>
                            </Select>
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
                            label="Documentation"
                            value={form.documentation}
                            onChange={(value) => setForm((f) => ({ ...f, documentation: value }))}
                            placeholder="Document what this highlight is, key features, and anything related — this replaces linking out to a separate blog post."
                            rows={16}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-border pt-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit">{"Create Highlight"}</Button>
                </div>
            </form>
        </div>
    )
}