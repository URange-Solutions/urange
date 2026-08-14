"use client"

import * as React from "react"

import {
    addPaymentChannel,
    createApp,
    removeApp,
    removePaymentChannel,
    rotateApiKey,
    rotateWebhookSecret,
    savePaymentConfig,
} from "@/actions/apps-actions"
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
    AlertTriangle,
    Check,
    Copy,
    CreditCard,
    KeyRound,
    Lock,
    Loader2,
    Plus,
    QrCode,
    RefreshCw,
    SearchIcon,
    SettingsIcon,
    Ticket,
    Trash2,
    Upload,
} from "lucide-react"

type PaymentChannel = {
    id: string
    name: string
    accountName: string
    accountNumber: string
    qrImageUrl?: string
}

type PaymentConfig = {
    channels: PaymentChannel[]
    callbackUrl: string
    successUrl: string
    failureUrl: string
    webhookSecretPrefix?: string | null
    webhookSecretLastRotatedAt?: string | null
}

type App = {
    id: string
    name: string
    slug: string
    description: string
    color: string
    apiKeyPrefix?: string | null
    apiKeyLastRotatedAt?: string | null
    payment?: PaymentConfig
}

const AVATAR_COLORS = [
    "#6366F1",
    "#EC4899",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#0EA5E9",
    "#8B5CF6",
    "#14B8A6",
]

function slugify(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
}

function formatDate(value?: string | null) {
    if (!value) return null
    try {
        return new Date(value).toLocaleString()
    } catch {
        return value
    }
}

function mapChannelRow(row: {
    id: string
    channel_name: string
    account_name: string
    account_number: string
    qr_code_url: string | null
}): PaymentChannel {
    return {
        id: row.id,
        name: row.channel_name,
        accountName: row.account_name,
        accountNumber: row.account_number,
        qrImageUrl: row.qr_code_url ?? undefined,
    }
}

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
        }
    }

    return (
        <Button type="button" variant="outline" size="icon" onClick={handleCopy}>
            {copied ? <Check className="text-emerald-600" /> : <Copy />}
        </Button>
    )
}

/**
 * Shown exactly once, right after a key/secret is generated server-side.
 * The plaintext value is never sent to the client again after this dialog
 * closes — only the hash + prefix persist.
 */
function RevealSecretDialog({
    open,
    onOpenChange,
    title,
    value,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    value: string | null
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Copy this now. For your security, it won't be shown again — only a masked prefix is kept.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-3">
                    <AlertTriangle className="size-4 shrink-0 text-amber-500" />
                    <code className="min-w-0 flex-1 truncate text-xs">{value}</code>
                    {value && <CopyButton value={value} />}
                </div>

                <DialogFooter>
                    <Button type="button" onClick={() => onOpenChange(false)}>
                        I've copied it
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function CreateAppDialog({
    open,
    onOpenChange,
    onCreate,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCreate: (input: { name: string; slug: string; description: string; color: string }) => Promise<void>
}) {
    const [name, setName] = React.useState("")
    const [description, setDescription] = React.useState("")
    const [color, setColor] = React.useState(AVATAR_COLORS[0])
    const [pending, setPending] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    function resetForm() {
        setName("")
        setDescription("")
        setColor(AVATAR_COLORS[0])
        setError(null)
    }

    function handleOpenChange(next: boolean) {
        if (!next) resetForm()
        onOpenChange(next)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim() || pending) return

        setPending(true)
        setError(null)
        try {
            await onCreate({
                name: name.trim(),
                slug: slugify(name),
                description: description.trim(),
                color,
            })
            handleOpenChange(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create app.")
        } finally {
            setPending(false)
        }
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

                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={pending}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!name.trim() || pending}>
                            {pending && <Loader2 data-icon="inline-start" className="animate-spin" />}
                            Create app
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

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
    const [pending, setPending] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [revealValue, setRevealValue] = React.useState<string | null>(null)
    const [revealOpen, setRevealOpen] = React.useState(false)

    async function handleGenerateKey() {
        if (pending) return
        setPending(true)
        setError(null)
        try {
            const { plaintext, prefix } = await rotateApiKey(app.id)
            onSave({ apiKeyPrefix: prefix, apiKeyLastRotatedAt: new Date().toISOString() })
            setRevealValue(plaintext)
            setRevealOpen(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate key.")
        } finally {
            setPending(false)
        }
    }

    const lastRotated = formatDate(app.apiKeyLastRotatedAt)

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
                {app.apiKeyPrefix ? (
                    <div className="flex gap-2">
                        <Input
                            id="cfg-api-key"
                            value={`${app.apiKeyPrefix}${"•".repeat(20)}`}
                            readOnly
                            className="font-mono text-xs"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleGenerateKey}
                            disabled={pending}
                            aria-label="Regenerate key"
                        >
                            {pending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                        </Button>
                    </div>
                ) : (
                    <Button type="button" variant="outline" onClick={handleGenerateKey} disabled={pending} className="w-fit">
                        {pending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <KeyRound data-icon="inline-start" />}
                        Generate key
                    </Button>
                )}
                <p className="text-xs text-muted-foreground">
                    Used to authenticate requests from this app. Regenerating invalidates the previous key
                    immediately.
                    {lastRotated ? ` Last rotated ${lastRotated}.` : ""}
                </p>
                {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <RevealSecretDialog
                open={revealOpen}
                onOpenChange={setRevealOpen}
                title="New API key"
                value={revealValue}
            />
        </div>
    )
}

function ChannelQrPreview({ url }: { url: string }) {
    return (
        <img
            src={url}
            alt="Channel QR code"
            className="size-14 shrink-0 rounded-md border object-cover"
        />
    )
}

function AddChannelForm({
    onAdd,
}: {
    onAdd: (channel: { name: string; accountName: string; accountNumber: string; qrImageUrl?: string }) => Promise<void>
}) {
    const [name, setName] = React.useState("")
    const [accountName, setAccountName] = React.useState("")
    const [accountNumber, setAccountNumber] = React.useState("")
    const [qrImageUrl, setQrImageUrl] = React.useState<string | undefined>(undefined)
    const [pending, setPending] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const fileRef = React.useRef<HTMLInputElement>(null)

    function handleQrChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => setQrImageUrl(reader.result as string)
        reader.readAsDataURL(file)
    }

    function reset() {
        setName("")
        setAccountName("")
        setAccountNumber("")
        setQrImageUrl(undefined)
        if (fileRef.current) fileRef.current.value = ""
    }

    async function handleAdd() {
        if (!name.trim() || !accountName.trim() || !accountNumber.trim() || pending) return
        setPending(true)
        setError(null)
        try {
            await onAdd({
                name: name.trim(),
                accountName: accountName.trim(),
                accountNumber: accountNumber.trim(),
                qrImageUrl,
            })
            reset()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add channel.")
        } finally {
            setPending(false)
        }
    }

    const canAdd = name.trim() && accountName.trim() && accountNumber.trim() && !pending

    return (
        <div className="grid gap-3 rounded-lg border border-dashed p-3">
            <div className="grid gap-3 sm:grid-cols-3">
                <div className="grid gap-2">
                    <Label htmlFor="new-channel-name">Channel name</Label>
                    <Input
                        id="new-channel-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="GCash, Maya, BPI…"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="new-channel-account-name">Account name</Label>
                    <Input
                        id="new-channel-account-name"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="Juan Dela Cruz"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="new-channel-account-number">Account number</Label>
                    <Input
                        id="new-channel-account-number"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="09XX XXX XXXX"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleQrChange}
                />
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                >
                    <Upload data-icon="inline-start" />
                    {qrImageUrl ? "Replace QR (optional)" : "Upload QR (optional)"}
                </Button>
                {qrImageUrl && <ChannelQrPreview url={qrImageUrl} />}
                {qrImageUrl && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setQrImageUrl(undefined)
                            if (fileRef.current) fileRef.current.value = ""
                        }}
                    >
                        Remove QR
                    </Button>
                )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-end">
                <Button type="button" size="sm" onClick={handleAdd} disabled={!canAdd}>
                    {pending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Plus data-icon="inline-start" />}
                    Add channel
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
    const [channels, setChannels] = React.useState<PaymentChannel[]>(app.payment?.channels ?? [])
    const [callbackUrl, setCallbackUrl] = React.useState(app.payment?.callbackUrl ?? "")
    const [successUrl, setSuccessUrl] = React.useState(app.payment?.successUrl ?? "")
    const [failureUrl, setFailureUrl] = React.useState(app.payment?.failureUrl ?? "")
    const [savingUrls, setSavingUrls] = React.useState(false)
    const [savedUrls, setSavedUrls] = React.useState(false)
    const [urlError, setUrlError] = React.useState<string | null>(null)

    const [secretPending, setSecretPending] = React.useState(false)
    const [secretError, setSecretError] = React.useState<string | null>(null)
    const [revealValue, setRevealValue] = React.useState<string | null>(null)
    const [revealOpen, setRevealOpen] = React.useState(false)

    React.useEffect(() => {
        setChannels(app.payment?.channels ?? [])
        setCallbackUrl(app.payment?.callbackUrl ?? "")
        setSuccessUrl(app.payment?.successUrl ?? "")
        setFailureUrl(app.payment?.failureUrl ?? "")
        setSavedUrls(false)
        setUrlError(null)
        setSecretError(null)
    }, [app.id])

    async function handleAddChannel(input: { name: string; accountName: string; accountNumber: string; qrImageUrl?: string }) {
        const row = await addPaymentChannel(app.id, input)
        const channel = mapChannelRow(row)
        const next = [...channels, channel]
        setChannels(next)
        onSave({ payment: { ...(app.payment as PaymentConfig), channels: next } })
    }

    async function handleRemoveChannel(id: string) {
        const prev = channels
        const next = channels.filter((c) => c.id !== id)
        setChannels(next) // optimistic
        try {
            await removePaymentChannel(app.id, id)
            onSave({ payment: { ...(app.payment as PaymentConfig), channels: next } })
        } catch (err) {
            setChannels(prev) // revert on failure
        }
    }

    async function handleSaveUrls() {
        if (savingUrls) return
        setSavingUrls(true)
        setUrlError(null)
        try {
            await savePaymentConfig(app.id, {
                callbackUrl: callbackUrl.trim(),
                successUrl: successUrl.trim(),
                failureUrl: failureUrl.trim(),
            })
            onSave({
                payment: {
                    ...(app.payment as PaymentConfig),
                    callbackUrl: callbackUrl.trim(),
                    successUrl: successUrl.trim(),
                    failureUrl: failureUrl.trim(),
                },
            })
            setSavedUrls(true)
            window.setTimeout(() => setSavedUrls(false), 1500)
        } catch (err) {
            setUrlError(err instanceof Error ? err.message : "Failed to save integration settings.")
        } finally {
            setSavingUrls(false)
        }
    }

    async function handleGenerateSecret() {
        if (secretPending) return
        setSecretPending(true)
        setSecretError(null)
        try {
            const { plaintext, prefix } = await rotateWebhookSecret(app.id)
            onSave({
                payment: {
                    ...(app.payment as PaymentConfig),
                    webhookSecretPrefix: prefix,
                    webhookSecretLastRotatedAt: new Date().toISOString(),
                },
            })
            setRevealValue(plaintext)
            setRevealOpen(true)
        } catch (err) {
            setSecretError(err instanceof Error ? err.message : "Failed to generate secret.")
        } finally {
            setSecretPending(false)
        }
    }

    const secretLastRotated = formatDate(app.payment?.webhookSecretLastRotatedAt)

    return (
        <div className="grid gap-6 py-2">
            <div className="grid gap-4">
                <div>
                    <p className="text-sm font-medium">Payout channels</p>
                    <p className="text-xs text-muted-foreground">
                        Payments collected by this app are sent to these accounts. Add as many channels as you accept.
                    </p>
                </div>

                {channels.length > 0 && (
                    <div className="grid gap-2">
                        {channels.map((channel) => (
                            <div
                                key={channel.id}
                                className="flex items-center gap-3 rounded-lg border p-3"
                            >
                                {channel.qrImageUrl ? (
                                    <ChannelQrPreview url={channel.qrImageUrl} />
                                ) : (
                                    <div className="flex size-14 shrink-0 items-center justify-center rounded-md border bg-muted">
                                        <QrCode className="size-5 text-muted-foreground" />
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">{channel.name}</span>
                                        <Badge variant="outline" className="text-muted-foreground">
                                            {channel.accountNumber}
                                        </Badge>
                                    </div>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {channel.accountName}
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveChannel(channel.id)}
                                    aria-label={`Remove ${channel.name}`}
                                >
                                    <Trash2 />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                <AddChannelForm onAdd={handleAddChannel} />
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

                <div className="grid gap-2">
                    <Label htmlFor="cfg-webhook-secret">Webhook secret</Label>
                    {app.payment?.webhookSecretPrefix ? (
                        <div className="flex gap-2">
                            <Input
                                id="cfg-webhook-secret"
                                value={`${app.payment.webhookSecretPrefix}${"•".repeat(20)}`}
                                readOnly
                                className="font-mono text-xs"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleGenerateSecret}
                                disabled={secretPending}
                                aria-label="Regenerate secret"
                            >
                                {secretPending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                            </Button>
                        </div>
                    ) : (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleGenerateSecret}
                            disabled={secretPending}
                            className="w-fit"
                        >
                            {secretPending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <KeyRound data-icon="inline-start" />}
                            Generate secret
                        </Button>
                    )}
                    <p className="text-xs text-muted-foreground">
                        Used to sign webhook payloads sent to your callback URL. Verify this signature before
                        trusting a webhook request. Regenerating invalidates the previous secret immediately.
                        {secretLastRotated ? ` Last rotated ${secretLastRotated}.` : ""}
                    </p>
                    {secretError && <p className="text-sm text-destructive">{secretError}</p>}
                </div>
            </div>

            {urlError && <p className="text-sm text-destructive">{urlError}</p>}

            <div className="flex justify-end">
                <Button type="button" onClick={handleSaveUrls} disabled={savingUrls}>
                    {savingUrls ? (
                        <Loader2 data-icon="inline-start" className="animate-spin" />
                    ) : savedUrls ? (
                        <Check data-icon="inline-start" />
                    ) : null}
                    {savedUrls ? "Saved" : "Save changes"}
                </Button>
            </div>

            <RevealSecretDialog
                open={revealOpen}
                onOpenChange={setRevealOpen}
                title="New webhook secret"
                value={revealValue}
            />
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

export function AppsGrid({ data: initialData }: { data: App[] }) {
    const [apps, setApps] = React.useState<App[]>(() => initialData)
    const [search, setSearch] = React.useState("")
    const [createOpen, setCreateOpen] = React.useState(false)
    const [configureApp, setConfigureApp] = React.useState<App | null>(null)
    const [removingId, setRemovingId] = React.useState<string | null>(null)

    const filtered = apps.filter((app) =>
        `${app.name} ${app.description}`.toLowerCase().includes(search.toLowerCase())
    )

    async function handleCreate(input: { name: string; slug: string; description: string; color: string }) {
        const row = await createApp(input)
        setApps((prev) => [
            {
                id: row.id,
                name: row.name,
                slug: row.slug,
                description: row.description ?? "",
                color: row.color,
                apiKeyPrefix: row.api_key_prefix,
                apiKeyLastRotatedAt: row.api_key_last_rotated_at,
                payment: {
                    channels: [],
                    callbackUrl: "",
                    successUrl: "",
                    failureUrl: "",
                    webhookSecretPrefix: null,
                    webhookSecretLastRotatedAt: null,
                },
            },
            ...prev,
        ])
    }

    async function handleRemove(id: string) {
        setRemovingId(id)
        try {
            await removeApp(id)
            setApps((prev) => prev.filter((a) => a.id !== id))
        } finally {
            setRemovingId(null)
        }
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
                            <Button
                                variant="destructive"
                                onClick={() => handleRemove(app.id)}
                                disabled={removingId === app.id}
                            >
                                {removingId === app.id ? (
                                    <Loader2 data-icon="inline-start" className="animate-spin" />
                                ) : (
                                    <Trash2 data-icon="inline-start" />
                                )}
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