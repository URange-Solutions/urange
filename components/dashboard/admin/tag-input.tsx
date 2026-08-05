import { Label } from "@/components/ui/label"
import { Badge, X } from "lucide-react"
import { useState } from "react"

export function TagInput({
    id,
    label,
    values,
    onChange,
    placeholder = "Add a tag and press Enter",
}: {
    id: string
    label: string
    values: string[]
    onChange: (values: string[]) => void
    placeholder?: string
}) {
    const [draft, setDraft] = useState("")

    function addTag() {
        const tag = draft.trim()
        if (!tag || values.includes(tag)) {
            setDraft("")
            return
        }
        onChange([...values, tag])
        setDraft("")
    }

    function removeTag(tag: string) {
        onChange(values.filter((t) => t !== tag))
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            addTag()
        } else if (e.key === "Backspace" && !draft && values.length) {
            onChange(values.slice(0, -1))
        }
    }

    return (
        <div className="flex flex-col gap-1.5">
            <Label htmlFor={id}>{label}</Label>
            <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-input px-2 py-1.5">
                {values.map((tag) => (
                    <Badge key={tag} className="gap-1 pr-1">
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            aria-label={`Remove ${tag}`}
                            className="rounded-full hover:bg-muted-foreground/20"
                        >
                            <X className="size-3" aria-hidden="true" />
                        </button>
                    </Badge>
                ))}
                <input
                    id={id}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={addTag}
                    placeholder={values.length ? "" : placeholder}
                    className="min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
            </div>
        </div>
    )
}