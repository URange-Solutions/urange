import { Label } from "@/components/ui/label"
import { ImageIcon, Loader2, Plus, Upload, X } from "lucide-react"
import { useRef, useState } from "react"

async function uploadFile(file: File): Promise<string> {
    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
        throw new Error(data?.error || data?.message || "Upload failed")
    }

    return data.url as string
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
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files
        if (!files || files.length === 0) return

        setError(null)
        setIsUploading(true)
        try {
            const urls = await Promise.all(Array.from(files as FileList).map((file) => uploadFile(file)))
            onChange([...values, ...urls])
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed")
        } finally {
            setIsUploading(false)
            e.target.value = ""
        }
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
                    disabled={isUploading}
                    className={`flex shrink-0 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border text-muted-foreground transition-colors hover:border-foreground/40 hover:bg-muted/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60 ${thumbnailClassName}`}
                >
                    {isUploading ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                        <Plus className="size-4" aria-hidden="true" />
                    )}
                    <span className="text-[10px] font-medium">{isUploading ? "Uploading" : "Add"}</span>
                </button>
                <input
                    ref={inputRef}
                    id={id}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFiles}
                    disabled={isUploading}
                />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
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
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setError(null)
        setIsUploading(true)
        try {
            const url = await uploadFile(file)
            onChange(url)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed")
        } finally {
            setIsUploading(false)
            e.target.value = ""
        }
    }

    return (
        <div className="flex flex-col gap-1.5">
            <Label htmlFor={id}>{label}</Label>
            <div className={`group relative overflow-hidden ${rounded} ${previewClassName}`}>
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={isUploading}
                    className="flex size-full items-center justify-center bg-muted transition-colors hover:bg-muted/70 disabled:cursor-not-allowed"
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

                {isUploading && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-1.5 bg-background/80 text-xs font-medium backdrop-blur-[1px]">
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                        Uploading...
                    </div>
                )}

                {!isUploading && value && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-1.5 bg-background/70 text-xs font-medium opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100">
                        <Upload className="size-3.5" aria-hidden="true" />
                        Replace
                    </div>
                )}

                {!isUploading && value && (
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        aria-label="Remove image"
                        className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow transition-colors hover:bg-destructive hover:text-destructive-foreground"
                    >
                        <X className="size-3.5" aria-hidden="true" />
                    </button>
                )}

                <input
                    ref={inputRef}
                    id={id}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFile}
                    disabled={isUploading}
                />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    )
}