// components/dashboard/admin/delete-payment-dialog.tsx
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2Icon } from "lucide-react"

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
import type { Payment } from "./payments-table"
import { deletePayment } from "@/actions/payment-actions"

export function DeletePaymentDialog({
    payment,
    open,
    onOpenChange,
}: {
    payment: Payment | null
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const router = useRouter()
    const [isPending, startTransition] = React.useTransition()

    function handleDelete() {
        if (!payment) return
        startTransition(async () => {
            const result = await deletePayment(payment.id)
            if (result.success) {
                toast.success("Payment deleted.")
                onOpenChange(false)
                router.refresh()
            } else {
                toast.error(result.error)
            }
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete this payment?</AlertDialogTitle>
                    <AlertDialogDescription>
                        {payment ? (
                            <>
                                You&apos;re about to permanently delete{" "}
                                <span className="font-medium text-foreground">
                                    {payment.ref_no}
                                </span>{" "}
                                ({payment.description}). This action cannot be undone and any
                                related payment history will be lost.
                            </>
                        ) : (
                            "This action cannot be undone."
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            handleDelete()
                        }}
                        disabled={isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isPending && <Loader2Icon className="animate-spin" />}
                        Delete payment
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}