import { Label } from "@/components/ui/label"
import { ImageIcon, Plus, Upload, X } from "lucide-react"
import { useRef } from "react"

function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(file)
    })
}

export function MultiImageUpload({
    id,
    label,
    values,
    onChange,
    thumbnailClassName = "size-20",
}: {
    id: string
    label: string
    values: string[]
    onChange: (values: string[]) => void
    thumbnailClassName?: string
}) {
    const inputRef = useRef<HTMLInputElement>(null)

    async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files
        if (!files || files.length === 0) return
        const dataUrls = await Promise.all(Array.from(files as FileList).map((file) => readFileAsDataUrl(file)))
        onChange([...values, ...dataUrls])
        e.target.value = ""
    }

    function removeAt(index: number) {
        onChange(values.filter((_, i) => i !== index))
    }

    return (
        <div className="flex flex-col gap-1.5">
            <Label htmlFor={id}>{label}</Label>
            <div className="flex flex-wrap gap-2">
                {values.map((src, index) => (
                    <div key={index} className={`group relative shrink-0 overflow-hidden rounded-md bg-muted ${thumbnailClassName}`}>
                        <img src={src} alt="" className="size-full object-cover" />
                        <button
                            type="button"
                            onClick={() => removeAt(index)}
                            aria-label="Remove image"
                            className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                        >
                            <X className="size-3" aria-hidden="true" />
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className={`flex shrink-0 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border text-muted-foreground transition-colors hover:border-foreground/40 hover:bg-muted/50 hover:text-foreground ${thumbnailClassName}`}
                >
                    <Plus className="size-4" aria-hidden="true" />
                    <span className="text-[10px] font-medium">Add</span>
                </button>
                <input ref={inputRef} id={id} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
            </div>
        </div>
    )
}

export function SingleImageUpload({
    id,
    label,
    value,
    onChange,
    previewClassName = "aspect-video w-full max-w-[220px]",
    rounded = "rounded-lg",
}: {
    id: string
    label: string
    value: string
    onChange: (value: string) => void
    previewClassName?: string
    rounded?: string
}) {
    const inputRef = useRef<HTMLInputElement>(null)

    async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        const dataUrl = await readFileAsDataUrl(file)
        onChange(dataUrl)
        e.target.value = ""
    }

    return (
        <div className="flex flex-col gap-1.5">
            <Label htmlFor={id}>{label}</Label>
            <div className={`group relative overflow-hidden ${rounded} ${previewClassName}`}>
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="flex size-full items-center justify-center bg-muted transition-colors hover:bg-muted/70"
                >
                    {value ? (
                        <img src={value} alt="" className="size-full object-cover" />
                    ) : (
                        <span className="flex flex-col items-center gap-1.5 text-muted-foreground">
                            <ImageIcon className="size-5" aria-hidden="true" />
                            <span className="text-xs font-medium">Click to upload</span>
                        </span>
                    )}
                </button>

                {value && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-1.5 bg-background/70 text-xs font-medium opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100">
                        <Upload className="size-3.5" aria-hidden="true" />
                        Replace
                    </div>
                )}

                {value && (
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        aria-label="Remove image"
                        className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow transition-colors hover:bg-destructive hover:text-destructive-foreground"
                    >
                        <X className="size-3.5" aria-hidden="true" />
                    </button>
                )}

                <input ref={inputRef} id={id} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>
        </div>
    )
}