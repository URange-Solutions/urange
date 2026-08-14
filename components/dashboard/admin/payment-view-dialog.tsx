"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2Icon, ImageIcon, ExpandIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import type { Payment } from "./payments-table"
import { approvePayment, declinePayment } from "@/actions/payment-actions"
import { Badge } from "@/components/ui/badge"

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2 text-sm">
            <span className="shrink-0 text-muted-foreground">{label}</span>
            <span className="text-right font-medium break-words">{value}</span>
        </div>
    )
}


export function formatCurrency(amount: string | number) {
    return `₱${Number(amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
}

export function formatDate(iso?: string | null) {
    if (!iso) return "—"
    return new Date(iso).toLocaleString("en-PH", {
        dateStyle: "medium",
        timeStyle: "short",
    })
}

export function StatusBadge({ status }: { status: string }) {
    const normalized = status.toLowerCase()

    const dotColor =
        normalized === "approved"
            ? "bg-green-500 dark:bg-green-400"
            : normalized === "declined" || normalized === "failed"
                ? "bg-red-500 dark:bg-red-400"
                : "bg-yellow-500 dark:bg-yellow-400"

    return (
        <Badge variant="outline" className="px-1.5 text-muted-foreground capitalize">
            <span className={`size-2 rounded-full ${dotColor}`} />
            {status}
        </Badge>
    )
}

function ProofOfPaymentPreview({ payment }: { payment: Payment }) {
    const [lightboxOpen, setLightboxOpen] = React.useState(false)
    const isImage = payment.proof_file_type?.startsWith("image/")

    if (!payment.proof_file_url) return null

    return (
        <div className="py-2">
            <p className="mb-2 text-sm text-muted-foreground">Proof of payment</p>

            {isImage ? (
                <>
                    <button
                        type="button"
                        onClick={() => setLightboxOpen(true)}
                        className="group relative block w-full overflow-hidden rounded-lg border"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={payment.proof_file_url}
                            alt={`Proof of payment for ${payment.ref_no}`}
                            className="max-h-64 w-full object-contain bg-muted/30"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
                            <span className="flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium">
                                <ExpandIcon className="size-3.5" />
                                View full size
                            </span>
                        </div>
                    </button>

                    <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
                        <DialogContent className="sm:max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Proof of Payment</DialogTitle>
                                <DialogDescription>Reference {payment.ref_no}</DialogDescription>
                            </DialogHeader>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={payment.proof_file_url}
                                alt={`Proof of payment for ${payment.ref_no}`}
                                className="max-h-[75vh] w-full rounded-lg border object-contain bg-muted/30"
                            />
                            <div className="flex justify-end">
                                <a
                                    href={payment.proof_file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary underline underline-offset-4"
                                >
                                    Open original
                                </a>
                            </div>
                        </DialogContent>
                    </Dialog>
                </>
            ) : (
                <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ImageIcon className="size-4" />
                        File can&apos;t be previewed inline.
                    </div>
                    <Button asChild size="sm" variant="outline">
                        <a href={payment.proof_file_url} target="_blank" rel="noopener noreferrer">
                            Open file
                        </a>
                    </Button>
                </div>
            )}
        </div>
    )
}

export function PaymentViewDialog({
    payment,
    open,
    onOpenChange,
}: {
    payment: Payment | null
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const router = useRouter()
    const [mode, setMode] = React.useState<"view" | "decline">("view")
    const [declineReason, setDeclineReason] = React.useState("")
    const [isPending, startTransition] = React.useTransition()

    React.useEffect(() => {
        if (open) {
            setMode("view")
            setDeclineReason("")
        }
    }, [open, payment?.id])

    const isPendingStatus = payment?.status.toLowerCase() === "pending"

    function handleApprove() {
        if (!payment) return
        startTransition(async () => {
            const result = await approvePayment(payment.id)
            if (result.success) {
                toast.success("Payment approved.")
                onOpenChange(false)
                router.refresh()
            } else {
                toast.error(result.error)
            }
        })
    }

    function handleDecline() {
        if (!payment) return
        if (declineReason.trim().length < 5) {
            toast.error("Please provide a more detailed reason (at least 5 characters).")
            return
        }
        startTransition(async () => {
            const result = await declinePayment(payment.id, declineReason.trim())
            if (result.success) {
                toast.success("Payment declined.")
                onOpenChange(false)
                router.refresh()
            } else {
                toast.error(result.error)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
            <DialogContent className="sm:max-w-lg">
                {payment && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                Payment details
                                <StatusBadge status={payment.status} />
                            </DialogTitle>
                            <DialogDescription>Reference {payment.ref_no}</DialogDescription>
                        </DialogHeader>

                        <div className="divide-y">
                            <DetailRow label="Description" value={payment.description} />
                            <DetailRow label="Amount" value={formatCurrency(payment.amount)} />
                            <DetailRow label="Merchant" value={payment.app?.name ?? "—"} />
                            <DetailRow
                                label="Payment channel"
                                value={payment.paymentChannel?.label ?? "—"}
                            />
                            <DetailRow
                                label="Customer"
                                value={
                                    payment.customer_name ? (
                                        <div className="flex flex-col">
                                            <span>{payment.customer_name}</span>
                                            {payment.customer_email && (
                                                <span className="text-xs font-normal text-muted-foreground">
                                                    {payment.customer_email}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        "—"
                                    )
                                }
                            />
                            <DetailRow label="Submitted" value={formatDate(payment.created_at)} />
                            <DetailRow
                                label="Paid at"
                                value={
                                    payment.approved_at
                                        ? formatDate(payment.approved_at)
                                        : "Not paid yet."
                                }
                            />
                            {payment.decline_reason && (
                                <DetailRow label="Decline reason" value={payment.decline_reason} />
                            )}
                        </div>

                        {payment.proof_file_url && <ProofOfPaymentPreview payment={payment} />}

                        {isPendingStatus && mode === "decline" && (
                            <div className="grid gap-2">
                                <Label htmlFor="decline-reason">Reason for declining</Label>
                                <Textarea
                                    id="decline-reason"
                                    placeholder="Explain why this payment is being declined..."
                                    value={declineReason}
                                    onChange={(e) => setDeclineReason(e.target.value)}
                                    disabled={isPending}
                                    rows={3}
                                    autoFocus
                                />
                            </div>
                        )}

                        <DialogFooter>
                            {isPendingStatus ? (
                                mode === "decline" ? (
                                    <div className="flex w-full justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setMode("view")}
                                            disabled={isPending}
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={handleDecline}
                                            disabled={isPending}
                                        >
                                            {isPending && <Loader2Icon className="animate-spin" />}
                                            Confirm decline
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex w-full justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setMode("decline")}
                                            disabled={isPending}
                                        >
                                            Decline
                                        </Button>
                                        <Button onClick={handleApprove} disabled={isPending}>
                                            {isPending && <Loader2Icon className="animate-spin" />}
                                            Approve
                                        </Button>
                                    </div>
                                )
                            ) : (
                                <Button variant="outline" onClick={() => onOpenChange(false)}>
                                    Close
                                </Button>
                            )}
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}