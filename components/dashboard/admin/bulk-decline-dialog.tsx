"use client"

import * as React from "react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { bulkDeclinePayments } from "@/actions/payment-actions"

export function BulkDeclineDialog({
    open,
    onOpenChange,
    paymentIds,
    onSuccess,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    paymentIds: string[]
    onSuccess: () => void
}) {
    const [reason, setReason] = React.useState("")
    const [isPending, startTransition] = React.useTransition()

    React.useEffect(() => {
        if (open) setReason("")
    }, [open])

    function handleConfirm() {
        startTransition(async () => {
            const result = await bulkDeclinePayments(paymentIds, reason)
            if (result.success) {
                toast.success(result.message ?? `${paymentIds.length} payment(s) declined.`)
                onOpenChange(false)
                onSuccess()
            } else {
                toast.error(result.error)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Decline {paymentIds.length} payment(s)?</DialogTitle>
                    <DialogDescription>
                        This marks the selected pending payments as declined. Any selected
                        payment that isn&apos;t currently pending will be skipped.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2 py-2">
                    <Label htmlFor="bulk-decline-reason">Reason</Label>
                    <Textarea
                        id="bulk-decline-reason"
                        placeholder="Explain why these payments are being declined..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isPending || reason.trim().length < 5}
                    >
                        {isPending ? "Declining..." : "Decline"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}