"use client"

import * as React from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"

import type { Ticket } from "./tickets-table"

const STATUS_OPTIONS = ["open", "in_progress", "resolved", "closed"] as const
const PRIORITY_OPTIONS = ["low", "medium", "high", "urgent"] as const
const ASSIGNEE_OPTIONS = [
    "Unassigned",
    "Jamie Cruz",
    "Pat Santos",
    "Ali Reyes",
    "Dana Lim",
] as const

function formatDate(iso?: string | null) {
    if (!iso) return "—"
    return new Date(iso).toLocaleString("en-PH", {
        dateStyle: "medium",
        timeStyle: "short",
    })
}

export function TicketDetailSheet({
    ticket,
    open,
    onOpenChange,
    onUpdate,
}: {
    ticket: Ticket | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onUpdate: (ticket: Ticket) => void
}) {
    const [reply, setReply] = React.useState("")

    React.useEffect(() => {
        if (!open) setReply("")
    }, [open])

    if (!ticket) return null

    function patch(partial: Partial<Ticket>) {
        onUpdate({
            ...ticket!,
            ...partial,
            updated_at: new Date().toISOString(),
        })
    }

    function handleAddReply() {
        if (!reply.trim()) return
        const notes = ticket!.metadata?.notes ?? []
        patch({
            metadata: {
                ...ticket!.metadata,
                notes: [
                    ...notes,
                    {
                        author: "You",
                        message: reply.trim(),
                        created_at: new Date().toISOString(),
                    },
                ],
            },
        })
        setReply("")
        toast("Reply added")
    }

    const notes = ticket.metadata?.notes ?? []

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex w-full flex-col gap-0 sm:max-w-lg">
                <SheetHeader>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-heading text-muted-foreground">
                            {ticket.ticket_number}
                        </Badge>
                        {ticket.metadata?.category && (
                            <Badge variant="secondary">{ticket.metadata.category}</Badge>
                        )}
                    </div>
                    <SheetTitle className="text-lg">{ticket.subject}</SheetTitle>
                    <SheetDescription>
                        Created {formatDate(ticket.created_at)} · Updated{" "}
                        {formatDate(ticket.updated_at)}
                    </SheetDescription>
                </SheetHeader>

                <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <span className="text-xs font-medium text-muted-foreground">
                                Status
                            </span>
                            <Select
                                value={ticket.status}
                                onValueChange={(value) => patch({ status: value })}
                            >
                                <SelectTrigger size="sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((s) => (
                                        <SelectItem key={s} value={s} className="capitalize">
                                            {s.replace("_", " ")}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <span className="text-xs font-medium text-muted-foreground">
                                Priority
                            </span>
                            <Select
                                value={ticket.priority}
                                onValueChange={(value) => patch({ priority: value })}
                            >
                                <SelectTrigger size="sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PRIORITY_OPTIONS.map((p) => (
                                        <SelectItem key={p} value={p} className="capitalize">
                                            {p}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-2 flex flex-col gap-1.5">
                            <span className="text-xs font-medium text-muted-foreground">
                                Assignee
                            </span>
                            <Select
                                value={ticket.assignee ?? "Unassigned"}
                                onValueChange={(value) =>
                                    patch({
                                        assignee: value === "Unassigned" ? null : value,
                                    })
                                }
                            >
                                <SelectTrigger size="sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ASSIGNEE_OPTIONS.map((a) => (
                                        <SelectItem key={a} value={a}>
                                            {a}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-medium text-muted-foreground">
                            Description
                        </span>
                        <p className="text-sm leading-relaxed">
                            {ticket.metadata?.description || "No description provided."}
                        </p>
                    </div>

                    <Separator />

                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-medium text-muted-foreground">
                            Customer
                        </span>
                        {ticket.metadata?.customer?.name ? (
                            <div className="flex flex-col text-sm">
                                <span className="font-medium">
                                    {ticket.metadata.customer.name}
                                </span>
                                {ticket.metadata.customer.email && (
                                    <span className="text-muted-foreground">
                                        {ticket.metadata.customer.email}
                                    </span>
                                )}
                                {ticket.metadata.customer.phone && (
                                    <span className="text-muted-foreground">
                                        {ticket.metadata.customer.phone}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <span className="text-sm text-muted-foreground">
                                No customer on file.
                            </span>
                        )}
                    </div>

                    <Separator />

                    <div className="flex flex-col gap-3">
                        <span className="text-xs font-medium text-muted-foreground">
                            Activity ({notes.length})
                        </span>
                        {notes.length === 0 && (
                            <p className="text-sm text-muted-foreground">No replies yet.</p>
                        )}
                        <div className="flex flex-col gap-3">
                            {notes.map((note, i) => (
                                <div
                                    key={i}
                                    className="flex flex-col gap-1 rounded-md border bg-muted/40 p-2.5 text-sm"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{note.author}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(note.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground">{note.message}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <SheetFooter className="flex-col gap-2 border-t pt-4">
                    <Textarea
                        placeholder="Write a reply or internal note…"
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        className="min-h-20"
                    />
                    <Button
                        onClick={handleAddReply}
                        disabled={!reply.trim()}
                        className="w-full"
                    >
                        Add reply
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}