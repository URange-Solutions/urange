"use client"

import { Loader2, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface DeleteConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    title?: string
    description?: string
    itemName?: string
    isLoading?: boolean
    confirmLabel?: string
    cancelLabel?: string
}

export function DeleteConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    title = "Delete item",
    description,
    itemName,
    isLoading = false,
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
}: DeleteConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={isLoading ? undefined : onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                            <TriangleAlert className="size-4.5 text-destructive" aria-hidden="true" />
                        </div>
                        <DialogTitle>{title}</DialogTitle>
                    </div>
                    <DialogDescription className="pt-1.5">
                        {description ?? (
                            <>
                                Are you sure you want to delete{" "}
                                {itemName ? <span className="font-medium text-foreground">{itemName}</span> : "this item"}?
                                This action cannot be undone.
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2 sm:gap-2">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        {cancelLabel}
                    </Button>
                    <Button type="button" variant="destructive" onClick={onConfirm} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />}
                        {isLoading ? "Deleting…" : confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}