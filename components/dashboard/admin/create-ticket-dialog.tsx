"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PlusIcon } from "lucide-react"

import type { Ticket } from "./tickets-table"

const PRIORITY_OPTIONS = ["low", "medium", "high", "urgent"] as const

const emptyForm = {
    subject: "",
    description: "",
    category: "",
    priority: "medium" as (typeof PRIORITY_OPTIONS)[number],
    customerName: "",
    customerEmail: "",
}

export function CreateTicketDialog({
    onCreate,
    ticketCount,
}: {
    onCreate: (ticket: Ticket) => void
    ticketCount: number
}) {
    const [open, setOpen] = React.useState(false)
    const [form, setForm] = React.useState(emptyForm)

    function update<K extends keyof typeof emptyForm>(
        key: K,
        value: (typeof emptyForm)[K]
    ) {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!form.subject.trim()) return

        const now = new Date().toISOString()
        const ticket: Ticket = {
            id:
                typeof crypto !== "undefined" && crypto.randomUUID
                    ? crypto.randomUUID()
                    : `${Date.now()}`,
            ticket_number: `TCK-${String(ticketCount + 1).padStart(4, "0")}`,
            subject: form.subject.trim(),
            priority: form.priority,
            status: "open",
            assignee: null,
            created_at: now,
            updated_at: now,
            metadata: {
                description: form.description.trim() || undefined,
                category: form.category.trim() || undefined,
                customer:
                    form.customerName.trim() || form.customerEmail.trim()
                        ? {
                              name: form.customerName.trim() || undefined,
                              email: form.customerEmail.trim() || undefined,
                          }
                        : undefined,
                notes: [],
            },
        }

        onCreate(ticket)
        toast(`Ticket ${ticket.ticket_number} created`)
        setForm(emptyForm)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <PlusIcon data-icon="inline-start" />
                    New Ticket
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>New ticket</DialogTitle>
                        <DialogDescription>
                            Log a new support ticket. You can assign it once it&apos;s
                            created.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-4 py-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                                id="subject"
                                required
                                value={form.subject}
                                onChange={(e) => update("subject", e.target.value)}
                                placeholder="Cannot log in to account"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={form.description}
                                onChange={(e) => update("description", e.target.value)}
                                placeholder="What's going on?"
                                className="min-h-24"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    value={form.category}
                                    onChange={(e) => update("category", e.target.value)}
                                    placeholder="Billing"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="priority">Priority</Label>
                                <Select
                                    value={form.priority}
                                    onValueChange={(value) =>
                                        update(
                                            "priority",
                                            value as (typeof PRIORITY_OPTIONS)[number]
                                        )
                                    }
                                >
                                    <SelectTrigger id="priority" size="sm">
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
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="customerName">Customer name</Label>
                                <Input
                                    id="customerName"
                                    value={form.customerName}
                                    onChange={(e) => update("customerName", e.target.value)}
                                    placeholder="Maria Santos"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="customerEmail">Customer email</Label>
                                <Input
                                    id="customerEmail"
                                    type="email"
                                    value={form.customerEmail}
                                    onChange={(e) => update("customerEmail", e.target.value)}
                                    placeholder="maria@email.com"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!form.subject.trim()}>
                            Create ticket
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}