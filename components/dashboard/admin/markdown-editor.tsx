"use client"

import { useRef } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

type MarkdownEditorProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}

type ToolbarAction = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  // wrap selection: prefix + selection + suffix
  wrap?: { prefix: string; suffix: string; placeholder: string }
  // prefix each selected line
  linePrefix?: string
}

const TOOLBAR: ToolbarAction[] = [
  { label: "Bold", icon: Bold, wrap: { prefix: "**", suffix: "**", placeholder: "bold text" } },
  { label: "Italic", icon: Italic, wrap: { prefix: "_", suffix: "_", placeholder: "italic text" } },
  { label: "Heading", icon: Heading2, linePrefix: "## " },
  { label: "Quote", icon: Quote, linePrefix: "> " },
  { label: "Bulleted list", icon: List, linePrefix: "- " },
  { label: "Numbered list", icon: ListOrdered, linePrefix: "1. " },
  { label: "Inline code", icon: Code, wrap: { prefix: "`", suffix: "`", placeholder: "code" } },
  { label: "Link", icon: LinkIcon, wrap: { prefix: "[", suffix: "](https://)", placeholder: "link text" } },
]

export function MarkdownEditor({ id, value, onChange, placeholder, rows = 12 }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function applyAction(action: ToolbarAction) {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = value.slice(start, end)

    let nextValue = value
    let nextSelStart = start
    let nextSelEnd = end

    if (action.wrap) {
      const { prefix, suffix, placeholder: ph } = action.wrap
      const inner = selected || ph
      nextValue = value.slice(0, start) + prefix + inner + suffix + value.slice(end)
      // select the inner text so the user can keep typing over the placeholder
      nextSelStart = start + prefix.length
      nextSelEnd = nextSelStart + inner.length
    } else if (action.linePrefix) {
      // expand selection to full lines
      const lineStart = value.lastIndexOf("\n", start - 1) + 1
      const lineEndIdx = value.indexOf("\n", end)
      const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx
      const block = value.slice(lineStart, lineEnd)
      const prefixed = block
        .split("\n")
        .map((line) => action.linePrefix + line)
        .join("\n")
      nextValue = value.slice(0, lineStart) + prefixed + value.slice(lineEnd)
      nextSelStart = lineStart
      nextSelEnd = lineStart + prefixed.length
    }

    onChange(nextValue)

    // restore focus + selection after React re-renders
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(nextSelStart, nextSelEnd)
    })
  }

  return (
    <Tabs defaultValue="write" className="w-full">
      <TabsList>
        <TabsTrigger value="write">Write</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>

      <TabsContent value="write" className="mt-2">
        <div className="overflow-hidden rounded-md border border-input bg-background">
          <div className="flex flex-wrap items-center gap-0.5 border-b border-input bg-muted/40 p-1">
            {TOOLBAR.map((action, index) => {
              const Icon = action.icon
              const showSeparator = index === 2 || index === 6
              return (
                <div key={action.label} className="flex items-center">
                  {showSeparator && <div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={action.label}
                    title={action.label}
                    onClick={() => applyAction(action)}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>
          <Textarea
            id={id}
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="rounded-none border-0 font-mono text-sm leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      </TabsContent>

      <TabsContent value="preview" className="mt-2">
        <div className="min-h-[200px] rounded-md border border-input bg-background p-4">
          {value.trim() ? (
            <div className="flex flex-col gap-3 text-sm leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h1 className="font-heading text-xl font-bold">{children}</h1>,
                  h2: ({ children }) => <h2 className="font-heading text-lg font-semibold">{children}</h2>,
                  h3: ({ children }) => <h3 className="font-heading text-base font-semibold">{children}</h3>,
                  p: ({ children }) => <p className="text-foreground">{children}</p>,
                  ul: ({ children }) => <ul className="ml-5 list-disc">{children}</ul>,
                  ol: ({ children }) => <ol className="ml-5 list-decimal">{children}</ol>,
                  a: ({ children, href }) => (
                    <a href={href} className="text-primary underline underline-offset-4">
                      {children}
                    </a>
                  ),
                  code: ({ children }) => (
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{children}</code>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-border pl-4 text-muted-foreground">{children}</blockquote>
                  ),
                }}
              >
                {value}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nothing to preview yet. Start writing in the Write tab.</p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
