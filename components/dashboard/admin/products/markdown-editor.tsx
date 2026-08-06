import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Bold, Code, EyeIcon, ImageIcon, Italic, Link as LinkIcon, List, ListOrdered, PencilLine } from "lucide-react"
import { useRef, useState } from "react"

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
        /!\[([^\]]*)\]\(([^)]+)\)/g,
        '<img src="$2" alt="$1" class="my-2 max-h-64 rounded-md border border-border object-cover" />',
    )
    out = out.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noreferrer" class="text-primary underline underline-offset-2">$1</a>',
    )
    return out
}

const HEADING_RE = /^(#{1,3})\s+(.*)/
const BULLET_RE = /^[-*]\s+/
const ORDERED_RE = /^\d+\.\s+/

function renderMarkdown(markdown: string): string {
    const trimmed = markdown.trim()
    if (!trimmed) {
        return '<p class="text-sm italic text-muted-foreground">Nothing to preview yet — switch to Write and add some notes.</p>'
    }

    const lines = trimmed.split("\n")
    const html: string[] = []
    let i = 0

    while (i < lines.length) {
        const line = lines[i]
        const trimmedLine = line.trim()

        // Blank line — just a separator, skip it.
        if (trimmedLine === "") {
            i++
            continue
        }

        // Fenced code block.
        if (trimmedLine.startsWith("```")) {
            const codeLines: string[] = []
            i++
            while (i < lines.length && !lines[i].trim().startsWith("```")) {
                codeLines.push(lines[i])
                i++
            }
            i++ // skip closing fence
            html.push(
                `<pre class="overflow-x-auto rounded-md bg-muted p-3 text-xs"><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`,
            )
            continue
        }

        // Heading — checked on every line, not just isolated single-line blocks.
        const headingMatch = line.match(HEADING_RE)
        if (headingMatch) {
            const level = headingMatch[1].length
            const cls =
                level === 1
                    ? "font-heading text-lg font-semibold"
                    : level === 2
                        ? "font-heading text-base font-semibold"
                        : "font-heading text-sm font-semibold"
            html.push(`<p class="${cls} mb-0">${renderInline(headingMatch[2])}</p>`)
            i++
            continue
        }

        // Bulleted list — consume consecutive "- " / "* " lines.
        if (BULLET_RE.test(trimmedLine)) {
            const items: string[] = []
            while (i < lines.length && BULLET_RE.test(lines[i].trim())) {
                items.push(`<li>${renderInline(lines[i].trim().replace(BULLET_RE, ""))}</li>`)
                i++
            }
            html.push(`<ul class="list-disc space-y-1 pl-5">${items.join("")}</ul>`)
            continue
        }

        // Numbered list — consume consecutive "N. " lines, preserving the start number.
        if (ORDERED_RE.test(trimmedLine)) {
            const start = parseInt(trimmedLine.match(/^(\d+)\./)?.[1] ?? "1", 10)
            const items: string[] = []
            while (i < lines.length && ORDERED_RE.test(lines[i].trim())) {
                items.push(`<li>${renderInline(lines[i].trim().replace(ORDERED_RE, ""))}</li>`)
                i++
            }
            html.push(`<ol class="list-decimal space-y-1 pl-5" start="${start}">${items.join("")}</ol>`)
            continue
        }

        // Paragraph — consume lines until we hit something that starts a new block type.
        const paraLines: string[] = []
        while (
            i < lines.length &&
            lines[i].trim() !== "" &&
            !lines[i].trim().startsWith("```") &&
            !HEADING_RE.test(lines[i]) &&
            !BULLET_RE.test(lines[i].trim()) &&
            !ORDERED_RE.test(lines[i].trim())
        ) {
            paraLines.push(lines[i])
            i++
        }
        html.push(`<p>${paraLines.map(renderInline).join("<br/>")}</p>`)
    }

    return html.join("")
}

type ToolbarAction = "bold" | "italic" | "code" | "link" | "image" | "bulletList" | "numberedList"

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
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const editorHeight = `${rows * 1.6}rem`

    function wrapSelection(before: string, after: string, placeholderText: string) {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selected = value.slice(start, end) || placeholderText
        const newValue = value.slice(0, start) + before + selected + after + value.slice(end)

        onChange(newValue)

        requestAnimationFrame(() => {
            textarea.focus()
            const selStart = start + before.length
            const selEnd = selStart + selected.length
            textarea.setSelectionRange(selStart, selEnd)
        })
    }

    function insertLinkOrImage(isImage: boolean) {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selected = value.slice(start, end) || (isImage ? "alt text" : "link text")
        const prefix = isImage ? "![" : "["
        const insert = `${prefix}${selected}](url)`
        const newValue = value.slice(0, start) + insert + value.slice(end)

        onChange(newValue)

        requestAnimationFrame(() => {
            textarea.focus()
            const urlStart = start + prefix.length + selected.length + 2
            const urlEnd = urlStart + 3
            textarea.setSelectionRange(urlStart, urlEnd)
        })
    }

    function stripListMarker(line: string) {
        return line.replace(/^(\s*)([-*]|\d+\.)\s+/, "$1")
    }

    function toggleList(ordered: boolean) {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd

        const lineStart = value.lastIndexOf("\n", start - 1) + 1
        let lineEnd = value.indexOf("\n", end)
        if (lineEnd === -1) lineEnd = value.length

        const selectedBlock = value.slice(lineStart, lineEnd)
        const lines = selectedBlock.split("\n")

        let counter = 1
        const newLines = lines.map((line) => {
            const stripped = stripListMarker(line)
            if (ordered) {
                return `${counter++}. ${stripped}`
            }
            return `- ${stripped}`
        })

        const newBlock = newLines.join("\n")
        const newValue = value.slice(0, lineStart) + newBlock + value.slice(lineEnd)

        onChange(newValue)

        requestAnimationFrame(() => {
            textarea.focus()
            textarea.setSelectionRange(lineStart, lineStart + newBlock.length)
        })
    }

    function handleToolbarAction(action: ToolbarAction) {
        if (mode !== "write") setMode("write")

        switch (action) {
            case "bold":
                wrapSelection("**", "**", "bold text")
                break
            case "italic":
                wrapSelection("*", "*", "italic text")
                break
            case "code":
                wrapSelection("`", "`", "code")
                break
            case "link":
                insertLinkOrImage(false)
                break
            case "image":
                insertLinkOrImage(true)
                break
            case "bulletList":
                toggleList(false)
                break
            case "numberedList":
                toggleList(true)
                break
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key !== "Enter") return

        const textarea = e.currentTarget
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        if (start !== end) return

        const beforeCursor = value.slice(0, start)
        const afterCursor = value.slice(start)
        const lineStart = beforeCursor.lastIndexOf("\n") + 1
        const currentLine = beforeCursor.slice(lineStart)

        const bulletMatch = currentLine.match(/^(\s*)([-*])\s+(.*)$/)
        const orderedMatch = currentLine.match(/^(\s*)(\d+)\.\s+(.*)$/)
        const match = bulletMatch || orderedMatch
        if (!match) return

        e.preventDefault()
        const [, indent, , content] = match as RegExpMatchArray

        if (content.trim() === "") {
            const newValue = value.slice(0, lineStart) + afterCursor
            onChange(newValue)
            requestAnimationFrame(() => {
                textarea.focus()
                textarea.setSelectionRange(lineStart, lineStart)
            })
            return
        }

        const nextMarker = bulletMatch ? `${bulletMatch[2]} ` : `${parseInt((orderedMatch as RegExpMatchArray)[2], 10) + 1}. `
        const insertion = `\n${indent}${nextMarker}`
        const newValue = beforeCursor + insertion + afterCursor
        onChange(newValue)

        requestAnimationFrame(() => {
            textarea.focus()
            const pos = start + insertion.length
            textarea.setSelectionRange(pos, pos)
        })
    }

    const toolbarButtons: { action: ToolbarAction; icon: typeof Bold; label: string }[] = [
        { action: "bold", icon: Bold, label: "Bold" },
        { action: "italic", icon: Italic, label: "Italic" },
        { action: "code", icon: Code, label: "Inline code" },
        { action: "link", icon: LinkIcon, label: "Link" },
        { action: "image", icon: ImageIcon, label: "Image" },
        { action: "bulletList", icon: List, label: "Bulleted list" },
        { action: "numberedList", icon: ListOrdered, label: "Numbered list" },
    ]

    return (
        <div className="flex h-full flex-col gap-1.5">
            <div className="flex items-center justify-between">
                <Label htmlFor={id}>{label}</Label>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                        {toolbarButtons.map(({ action, icon: Icon, label: btnLabel }) => (
                            <button
                                key={action}
                                type="button"
                                title={btnLabel}
                                aria-label={btnLabel}
                                onClick={() => handleToolbarAction(action)}
                                className="inline-flex size-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                                <Icon className="size-3.5" aria-hidden="true" />
                            </button>
                        ))}
                    </div>

                    <div className="h-5 w-px bg-border" aria-hidden="true" />

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
            </div>

            {mode === "write" ? (
                <Textarea
                    id={id}
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    rows={rows}
                    style={{ height: editorHeight }}
                    className="resize-none font-mono text-sm"
                />
            ) : (
                <div
                    className="overflow-y-auto rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:mb-3 [&_ol]:mb-3 [&_pre]:mb-3"
                    style={{ height: editorHeight }}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
                />
            )}
            <p className="text-xs text-muted-foreground">Supports headings (#, ##), **bold**, *italic*, `code`, links, and lists.</p>
        </div>
    )
}