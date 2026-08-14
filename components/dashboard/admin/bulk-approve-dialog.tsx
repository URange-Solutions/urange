"use client"

import * as React from "react"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { bulkApprovePayments } from "@/actions/payment-actions"

export function BulkApproveDialog({
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
    const [isPending, startTransition] = React.useTransition()

    function handleConfirm() {
        startTransition(async () => {
            const result = await bulkApprovePayments(paymentIds)
            if (result.success) {
                toast.success(result.message ?? `${paymentIds.length} payment(s) approved.`)
                onOpenChange(false)
                onSuccess()
            } else {
                toast.error(result.error)
            }
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Approve {paymentIds.length} payment(s)?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This marks the selected pending payments as approved. Any selected
                        payment that isn&apos;t currently pending will be skipped. This
                        action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
                        {isPending ? "Approving..." : "Approve"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}