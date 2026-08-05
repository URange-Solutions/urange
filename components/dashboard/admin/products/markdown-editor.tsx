import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { EyeIcon, PencilLine } from "lucide-react"
import { useState } from "react"

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
}

function renderInline(text: string): string {
    let out = escapeHtml(text)
    out = out.replace(/`([^`]+)`/g, '<code class="rounded bg-muted px-1 py-0.5 text-[0.85em]">$1</code>')
    out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    out = out.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>")
    out = out.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noreferrer" class="text-primary underline underline-offset-2">$1</a>',
    )
    return out
}

function renderMarkdown(markdown: string): string {
    const trimmed = markdown.trim()
    if (!trimmed) {
        return '<p class="text-sm italic text-muted-foreground">Nothing to preview yet — switch to Write and add some notes.</p>'
    }

    const blocks = trimmed.split(/\n{2,}/)

    return blocks
        .map((block) => {
            if (block.startsWith("```")) {
                const code = block.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "")
                return `<pre class="overflow-x-auto rounded-md bg-muted p-3 text-xs"><code>${escapeHtml(code)}</code></pre>`
            }

            const lines = block.split("\n")

            const headerMatch = lines.length === 1 ? lines[0].match(/^(#{1,3})\s+(.*)/) : null
            if (headerMatch) {
                const level = headerMatch[1].length
                const cls =
                    level === 1
                        ? "font-heading text-lg font-semibold"
                        : level === 2
                            ? "font-heading text-base font-semibold"
                            : "font-heading text-sm font-semibold"
                return `<p class="${cls} mb-0">${renderInline(headerMatch[2])}</p>`
            }

            if (lines.every((l) => /^[-*]\s+/.test(l.trim()))) {
                const items = lines.map((l) => `<li>${renderInline(l.trim().replace(/^[-*]\s+/, ""))}</li>`).join("")
                return `<ul class="list-disc space-y-1 pl-5">${items}</ul>`
            }

            if (lines.every((l) => /^\d+\.\s+/.test(l.trim()))) {
                const items = lines.map((l) => `<li>${renderInline(l.trim().replace(/^\d+\.\s+/, ""))}</li>`).join("")
                return `<ol class="list-decimal space-y-1 pl-5">${items}</ol>`
            }

            return `<p>${lines.map(renderInline).join("<br/>")}</p>`
        })
        .join("")
}


export function MarkdownEditor({
    id,
    label,
    value,
    onChange,
    placeholder = "Document what this is, key features, and anything related...",
    rows = 14,
}: {
    id: string
    label: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    rows?: number
}) {
    const [mode, setMode] = useState<"write" | "preview">("write")

    return (
        <div className="flex h-full flex-col gap-1.5">
            <div className="flex items-center justify-between">
                <Label htmlFor={id}>{label}</Label>
                <div className="flex items-center gap-0.5 rounded-md border border-border p-0.5">
                    <button
                        type="button"
                        onClick={() => setMode("write")}
                        className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors ${mode === "write" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <PencilLine className="size-3.5" aria-hidden="true" />
                        Write
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("preview")}
                        className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors ${mode === "preview" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <EyeIcon className="size-3.5" aria-hidden="true" />
                        Preview
                    </button>
                </div>
            </div>

            {mode === "write" ? (
                <Textarea
                    id={id}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={rows}
                    className="resize-y font-mono text-sm"
                />
            ) : (
                <div
                    className="min-h-[280px] rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:mb-3 [&_ol]:mb-3 [&_pre]:mb-3"
                    style={{ minHeight: `${rows * 1.6}rem` }}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
                />
            )}
            <p className="text-xs text-muted-foreground">Supports headings (#, ##), **bold**, *italic*, `code`, links, and lists.</p>
        </div>
    )
}
