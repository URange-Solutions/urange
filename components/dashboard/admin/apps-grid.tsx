"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
    Check,
    Copy,
    CreditCard,
    Eye,
    EyeOff,
    KeyRound,
    Lock,
    Plus,
    RefreshCw,
    SearchIcon,
    SettingsIcon,
    Ticket,
    Trash2,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PaymentConfig = {
    gcashName: string
    gcashNumber: string
    callbackUrl: string
    successUrl: string
    failureUrl: string
}

type App = {
    id: string
    name: string
    slug: string
    description: string
    color: string
    apiKey?: string
    payment?: PaymentConfig
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const AVATAR_COLORS = [
    "#6366F1", // indigo
    "#EC4899", // pink
    "#10B981", // emerald
    "#F59E0B", // amber
    "#EF4444", // red
    "#0EA5E9", // sky
    "#8B5CF6", // violet
    "#14B8A6", // teal
]

function slugify(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
}

function generateApiKey() {
    const bytes = new Uint8Array(24)
    crypto.getRandomValues(bytes)
    const random = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
    return `sk_live_${random}`
}

function maskApiKey(key: string) {
    return `${key.slice(0, 11)}${"•".repeat(20)}${key.slice(-4)}`
}

// ---------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------

function AppAvatar({ name, color }: { name: string; color: string }) {
    return (
        <div
            className="flex size-11 shrink-0 items-center justify-center rounded-xl text-base font-semibold text-white"
            style={{ backgroundColor: color }}
        >
            {name.slice(0, 2).toUpperCase()}
        </div>
    )
}

function CopyButton({ value }: { value: string }) {
    const [copied, setCopied] = React.useState(false)

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(value)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1500)
        } catch {
            // clipboard unavailable — silently ignore
        }
    }

    return (
        <Button type="button" variant="outline" size="icon" onClick={handleCopy}>
            {copied ? <Check className="text-emerald-600" /> : <Copy />}
        </Button>
    )
}

// ---------------------------------------------------------------------------
// Create App dialog
// ---------------------------------------------------------------------------

function CreateAppDialog({
    open,
    onOpenChange,
    onCreate,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCreate: (app: App) => void
}) {
    const [name, setName] = React.useState("")
    const [description, setDescription] = React.useState("")
    const [color, setColor] = React.useState(AVATAR_COLORS[0])

    function resetForm() {
        setName("")
        setDescription("")
        setColor(AVATAR_COLORS[0])
    }

    function handleOpenChange(next: boolean) {
        if (!next) resetForm()
        onOpenChange(next)
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim()) return

        onCreate({
            id: crypto.randomUUID(),
            name: name.trim(),
            slug: slugify(name),
            description: description.trim(),
            color,
        })
        handleOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create app</DialogTitle>
                        <DialogDescription>
                            Give your app a name and description. You can configure payments and other settings afterward.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="app-name">App name</Label>
                            <Input
                                id="app-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Storefront"
                                autoFocus
                                required
                            />
                            {name.trim() && (
                                <p className="text-xs text-muted-foreground">
                                    Slug: <span className="font-mono">{slugify(name)}</span>
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="app-description">Description</Label>
                            <Textarea
                                id="app-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What does this app do?"
                                rows={3}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Color</Label>
                            <div className="flex flex-wrap gap-2">
                                {AVATAR_COLORS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setColor(c)}
                                        className={cn(
                                            "size-7 rounded-full ring-offset-2 ring-offset-background transition",
                                            color === c && "ring-2 ring-foreground"
                                        )}
                                        style={{ backgroundColor: c }}
                                        aria-label={`Select color ${c}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!name.trim()}>
                            Create app
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

// ---------------------------------------------------------------------------
// Configure App dialog
// ---------------------------------------------------------------------------

function ComingSoonTab({ icon: Icon, label }: { icon: typeof Ticket; label: string }) {
    return (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center">
            <Icon className="size-5 text-muted-foreground" />
            <p className="text-sm font-medium">{label} isn't set up yet</p>
            <p className="text-xs text-muted-foreground">This configuration will be available soon.</p>
        </div>
    )
}

function GeneralTab({
    app,
    onSave,
}: {
    app: App
    onSave: (updates: Partial<App>) => void
}) {
    const [apiKey, setApiKey] = React.useState(app.apiKey)
    const [revealKey, setRevealKey] = React.useState(false)
    const [saved, setSaved] = React.useState(false)

    React.useEffect(() => {
        setApiKey(app.apiKey)
        setRevealKey(false)
        setSaved(false)
    }, [app.id])

    function handleGenerateKey() {
        setApiKey(generateApiKey())
        setRevealKey(true)
    }

    function handleSave() {
        onSave({ apiKey })
        setSaved(true)
        window.setTimeout(() => setSaved(false), 1500)
    }

    return (
        <div className="grid gap-6 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="cfg-app-name">App name</Label>
                    <Input id="cfg-app-name" value={app.name} readOnly disabled />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="cfg-app-id">App ID</Label>
                    <div className="flex gap-2">
                        <Input id="cfg-app-id" value={app.id} readOnly disabled className="font-mono text-xs" />
                        <CopyButton value={app.id} />
                    </div>
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="cfg-api-key">API key</Label>
                {apiKey ? (
                    <div className="flex gap-2">
                        <Input
                            id="cfg-api-key"
                            value={revealKey ? apiKey : maskApiKey(apiKey)}
                            readOnly
                            className="font-mono text-xs"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setRevealKey((v) => !v)}
                            aria-label={revealKey ? "Hide key" : "Reveal key"}
                        >
                            {revealKey ? <EyeOff /> : <Eye />}
                        </Button>
                        <CopyButton value={apiKey} />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleGenerateKey}
                            aria-label="Regenerate key"
                        >
                            <RefreshCw />
                        </Button>
                    </div>
                ) : (
                    <Button type="button" variant="outline" onClick={handleGenerateKey} className="w-fit">
                        <KeyRound data-icon="inline-start" />
                        Generate key
                    </Button>
                )}
                <p className="text-xs text-muted-foreground">
                    Used to authenticate requests from this app. Regenerating invalidates the previous key.
                </p>
            </div>

            <div className="flex justify-end">
                <Button type="button" onClick={handleSave}>
                    {saved ? <Check data-icon="inline-start" /> : null}
                    {saved ? "Saved" : "Save changes"}
                </Button>
            </div>
        </div>
    )
}

function PaymentsTab({
    app,
    onSave,
}: {
    app: App
    onSave: (updates: Partial<App>) => void
}) {
    const [gcashName, setGcashName] = React.useState(app.payment?.gcashName ?? "")
    const [gcashNumber, setGcashNumber] = React.useState(app.payment?.gcashNumber ?? "")
    const [callbackUrl, setCallbackUrl] = React.useState(app.payment?.callbackUrl ?? "")
    const [successUrl, setSuccessUrl] = React.useState(app.payment?.successUrl ?? "")
    const [failureUrl, setFailureUrl] = React.useState(app.payment?.failureUrl ?? "")
    const [saved, setSaved] = React.useState(false)

    // Reset local form state whenever a different app is opened
    React.useEffect(() => {
        setGcashName(app.payment?.gcashName ?? "")
        setGcashNumber(app.payment?.gcashNumber ?? "")
        setCallbackUrl(app.payment?.callbackUrl ?? "")
        setSuccessUrl(app.payment?.successUrl ?? "")
        setFailureUrl(app.payment?.failureUrl ?? "")
        setSaved(false)
    }, [app.id])

    function handleSave() {
        onSave({
            payment: {
                gcashName: gcashName.trim(),
                gcashNumber: gcashNumber.trim(),
                callbackUrl: callbackUrl.trim(),
                successUrl: successUrl.trim(),
                failureUrl: failureUrl.trim(),
            },
        })
        setSaved(true)
        window.setTimeout(() => setSaved(false), 1500)
    }

    return (
        <div className="grid gap-6 py-2">
            <div className="grid gap-4">
                <div>
                    <p className="text-sm font-medium">GCash payout account</p>
                    <p className="text-xs text-muted-foreground">
                        Payments collected by this app are sent to this GCash account.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="cfg-gcash-name">Account name</Label>
                        <Input
                            id="cfg-gcash-name"
                            value={gcashName}
                            onChange={(e) => setGcashName(e.target.value)}
                            placeholder="Juan Dela Cruz"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="cfg-gcash-number">GCash number</Label>
                        <Input
                            id="cfg-gcash-number"
                            value={gcashNumber}
                            onChange={(e) => setGcashNumber(e.target.value)}
                            placeholder="09XX XXX XXXX"
                            inputMode="numeric"
                        />
                    </div>
                </div>
            </div>

            <Separator />

            <div className="grid gap-4">
                <div>
                    <p className="text-sm font-medium">Urange integration</p>
                    <p className="text-xs text-muted-foreground">
                        Urange posts payment events to your callback URL, then redirects the payer to the
                        matching success or failure URL.
                    </p>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="cfg-callback-url">Callback URL (webhook)</Label>
                    <Input
                        id="cfg-callback-url"
                        value={callbackUrl}
                        onChange={(e) => setCallbackUrl(e.target.value)}
                        placeholder="https://your-app.com/api/urange/webhook"
                        inputMode="url"
                    />
                    <p className="text-xs text-muted-foreground">
                        Urange POSTs status updates (paid, failed, refunded) to this endpoint.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="cfg-success-url">Success redirect URL</Label>
                        <Input
                            id="cfg-success-url"
                            value={successUrl}
                            onChange={(e) => setSuccessUrl(e.target.value)}
                            placeholder="https://your-app.com/checkout/success"
                            inputMode="url"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="cfg-failure-url">Failure redirect URL</Label>
                        <Input
                            id="cfg-failure-url"
                            value={failureUrl}
                            onChange={(e) => setFailureUrl(e.target.value)}
                            placeholder="https://your-app.com/checkout/failed"
                            inputMode="url"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="button" onClick={handleSave}>
                    {saved ? <Check data-icon="inline-start" /> : null}
                    {saved ? "Saved" : "Save changes"}
                </Button>
            </div>
        </div>
    )
}

function ConfigureAppDialog({
    app,
    onOpenChange,
    onSave,
}: {
    app: App | null
    onOpenChange: (open: boolean) => void
    onSave: (appId: string, updates: Partial<App>) => void
}) {
    return (
        <Dialog open={!!app} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                {app && (
                    <>
                        <DialogHeader>
                            <div className="flex items-center gap-3">
                                <AppAvatar name={app.name} color={app.color} />
                                <div>
                                    <DialogTitle>{app.name}</DialogTitle>
                                    <DialogDescription>Configure {app.name}</DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <Tabs defaultValue="general" className="mt-2">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="general">
                                    <KeyRound data-icon="inline-start" />
                                    General
                                </TabsTrigger>
                                <TabsTrigger value="payments">
                                    <CreditCard data-icon="inline-start" />
                                    Payments
                                </TabsTrigger>
                                <TabsTrigger value="oauth" disabled>
                                    <Lock data-icon="inline-start" />
                                    OAuth
                                </TabsTrigger>
                                <TabsTrigger value="tickets" disabled>
                                    <Lock data-icon="inline-start" />
                                    Tickets
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="general">
                                <GeneralTab app={app} onSave={(updates) => onSave(app.id, updates)} />
                            </TabsContent>

                            <TabsContent value="payments">
                                <PaymentsTab app={app} onSave={(updates) => onSave(app.id, updates)} />
                            </TabsContent>

                            <TabsContent value="oauth">
                                <ComingSoonTab icon={Lock} label="OAuth" />
                            </TabsContent>

                            <TabsContent value="tickets">
                                <ComingSoonTab icon={Ticket} label="Tickets" />
                            </TabsContent>
                        </Tabs>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}

// ---------------------------------------------------------------------------
// Main grid
// ---------------------------------------------------------------------------

export function AppsGrid({ data: initialData }: { data: App[] }) {
    const [apps, setApps] = React.useState<App[]>(() => initialData)
    const [search, setSearch] = React.useState("")
    const [createOpen, setCreateOpen] = React.useState(false)
    const [configureApp, setConfigureApp] = React.useState<App | null>(null)

    const filtered = apps.filter((app) =>
        `${app.name} ${app.description}`.toLowerCase().includes(search.toLowerCase())
    )

    function handleCreate(app: App) {
        setApps((prev) => [app, ...prev])
    }

    function handleRemove(id: string) {
        setApps((prev) => prev.filter((a) => a.id !== id))
    }

    function handleConfigureSave(appId: string, updates: Partial<App>) {
        setApps((prev) => prev.map((a) => (a.id === appId ? { ...a, ...updates } : a)))
        setConfigureApp((prev) => (prev && prev.id === appId ? { ...prev, ...updates } : prev))
    }

    return (
        <div className="flex flex-col gap-4 px-4 lg:px-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="relative w-full max-w-xs">
                    <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search apps…"
                        className="pl-8"
                    />
                </div>
                <Button onClick={() => setCreateOpen(true)}>
                    <Plus />
                    <span className="hidden lg:inline">Create App</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @5xl/main:grid-cols-3">
                {filtered.map((app) => (
                    <Card key={app.id} className="@container/card">
                        <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                            <AppAvatar name={app.name} color={app.color} />
                            <div className="flex flex-1 flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                    <span className="font-heading font-semibold">
                                        {app.name}
                                    </span>
                                    <Badge variant="outline" className="text-muted-foreground">
                                        {app.slug}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {app.description}
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-3">
                            <Button variant="outline" onClick={() => setConfigureApp(app)}>
                                <SettingsIcon data-icon="inline-start" />
                                Configure
                            </Button>
                            <Button variant="destructive" onClick={() => handleRemove(app.id)}>
                                <Trash2 data-icon="inline-start" />
                                Remove
                            </Button>
                        </CardContent>
                    </Card>
                ))}
                {filtered.length === 0 && (
                    <div className="col-span-full flex h-32 items-center justify-center text-sm text-muted-foreground">
                        No apps match your search.
                    </div>
                )}
            </div>

            <CreateAppDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={handleCreate} />
            <ConfigureAppDialog
                app={configureApp}
                onOpenChange={(open) => !open && setConfigureApp(null)}
                onSave={handleConfigureSave}
            />
        </div>
    )
}