"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { Search, Mail, MailOpen, MailCheck, Trash2, Inbox, Calendar, Reply as ReplyIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useRouter, usePathname } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { DeleteConfirmDialog } from "@/components/modals/DeleteConfirmModal"
import { deleteMessage, markMessageRead, sendReply } from "@/actions/inbox"

type MessageRow = {
    id: string
    created_at: string | null
    name: string
    email: string
    subject: string
    message: string
    is_read: boolean | null
    is_replied: boolean | null
    replied_at: string | null
    reply_message: string | null
}

type StatusFilter = "all" | "unread" | "read" | "replied"

interface InboxManagementPageProps {
    messages: MessageRow[]
    initialQuery: string
    initialStatus: StatusFilter
}

export default function InboxManagementPage({
    messages,
    initialQuery,
    initialStatus,
}: InboxManagementPageProps) {
    const [query, setQuery] = useState(initialQuery)
    const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus)
    const [isPending, startTransition] = useTransition()
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<MessageRow | null>(null)
    const [readTarget, setReadTarget] = useState<MessageRow | null>(null)

    // Reply dialog state
    const [replyTarget, setReplyTarget] = useState<MessageRow | null>(null)
    const [replyText, setReplyText] = useState("")
    const [isSendingReply, setIsSendingReply] = useState(false)

    const router = useRouter()
    const pathname = usePathname()
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    function pushParams(nextQuery: string, nextStatus: StatusFilter) {
        const params = new URLSearchParams()
        if (nextQuery) params.set("q", nextQuery)
        if (nextStatus !== "all") params.set("status", nextStatus)

        startTransition(() => {
            router.push(`${pathname}${params.toString() ? `?${params}` : ""}`)
        })
    }

    function handleQueryChange(value: string) {
        setQuery(value)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            pushParams(value, statusFilter)
        }, 350)
    }

    function handleStatusChange(value: StatusFilter) {
        setStatusFilter(value)
        pushParams(query, value)
    }

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [])

    function requestDelete(message: MessageRow) {
        setDeleteTarget(message)
    }

    function confirmDelete() {
        if (!deleteTarget) return
        const id = deleteTarget.id
        setPendingDeleteId(id)
        startTransition(async () => {
            try {
                await deleteMessage(id)
                setDeleteTarget(null)
            } catch (err) {
                console.error("Failed to delete message:", err)
            } finally {
                setPendingDeleteId(null)
            }
        })
    }

    function openMessage(message: MessageRow) {
        setReadTarget(message)
        if (!message.is_read) {
            startTransition(async () => {
                try {
                    await markMessageRead(message.id)
                } catch (err) {
                    console.error("Failed to mark message read:", err)
                }
            })
        }
    }

    function openReply(message: MessageRow) {
        setReplyTarget(message)
        setReplyText("")
    }

    function handleSendReply() {
        if (!replyTarget || !replyText.trim()) return
        setIsSendingReply(true)
        startTransition(async () => {
            try {
                await sendReply({
                    id: replyTarget.id,
                    toEmail: replyTarget.email,
                    toName: replyTarget.name,
                    originalSubject: replyTarget.subject,
                    body: replyText,
                })
                setReplyTarget(null)
                setReplyText("")
            } catch (err) {
                console.error("Failed to send reply:", err)
            } finally {
                setIsSendingReply(false)
            }
        })
    }

    function formatDate(value: string | null) {
        if (!value) return "—"
        return new Date(value).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <header className="mt-6 mx-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="font-heading text-2xl font-bold">Inbox</h1>
                        <p className="text-muted-foreground">Client messages and requests submitted through UrangeSys.</p>
                    </div>
                </header>

                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <div className="mx-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full sm:max-w-xs">
                            <Search
                                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                                aria-hidden="true"
                            />
                            <Input
                                type="search"
                                value={query}
                                onChange={(e) => handleQueryChange(e.target.value)}
                                placeholder="Search messages..."
                                aria-label="Search messages"
                                className="pl-9"
                            />
                        </div>

                        <Select value={statusFilter} onValueChange={(value) => handleStatusChange(value as StatusFilter)}>
                            <SelectTrigger className="w-full sm:w-40" aria-label="Filter by status">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All messages</SelectItem>
                                <SelectItem value="unread">Unread</SelectItem>
                                <SelectItem value="read">Read</SelectItem>
                                <SelectItem value="replied">Replied</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {messages.length === 0 ? (
                        <div className="mx-6 flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
                            <Inbox className="size-8 text-muted-foreground" aria-hidden="true" />
                            <div>
                                <p className="font-medium">No messages found</p>
                                <p className="text-sm text-muted-foreground">Try adjusting your search or check back later.</p>
                            </div>
                        </div>
                    ) : (
                        <div
                            className={`mx-6 overflow-hidden rounded-lg border border-border transition-opacity ${isPending ? "opacity-60" : "opacity-100"
                                }`}
                        >
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-10"></TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead className="w-32">Date</TableHead>
                                        <TableHead className="w-24 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {messages.map((message) => {
                                        const isUnread = !message.is_read
                                        const isDeleting = isPending && pendingDeleteId === message.id

                                        return (
                                            <TableRow
                                                key={message.id}
                                                className="cursor-pointer"
                                                onClick={() => openMessage(message)}
                                            >
                                                <TableCell>
                                                    {isUnread ? (
                                                        <Mail className="size-4 text-primary" aria-hidden="true" />
                                                    ) : (
                                                        <MailOpen className="size-4 text-muted-foreground" aria-hidden="true" />
                                                    )}
                                                </TableCell>
                                                <TableCell className={isUnread ? "font-semibold" : undefined}>
                                                    {message.name}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{message.email}</TableCell>
                                                <TableCell className={`line-clamp-1 ${isUnread ? "font-semibold" : ""}`}>
                                                    <span className="inline-flex items-center gap-2">
                                                        {message.subject}
                                                        {isUnread && (
                                                            <Badge variant="default" className="h-4.5 px-1.5 text-[10px]">
                                                                New
                                                            </Badge>
                                                        )}
                                                        {message.is_replied && (
                                                            <Badge variant="secondary" className="h-4.5 px-1.5 text-[10px] gap-1">
                                                                <MailCheck className="size-2.5" aria-hidden="true" />
                                                                Replied
                                                            </Badge>
                                                        )}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    <span className="inline-flex items-center gap-1">
                                                        <Calendar className="size-3" aria-hidden="true" />
                                                        {formatDate(message.created_at)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={isPending && pendingDeleteId === message.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            requestDelete(message)
                                                        }}
                                                        className="gap-1.5 text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="size-3.5" aria-hidden="true" />
                                                        {isDeleting ? "Deleting…" : ""}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>

            {/* View message dialog */}
            <Dialog open={Boolean(readTarget)} onOpenChange={(open) => { if (!open) setReadTarget(null) }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="font-heading">{readTarget?.subject}</DialogTitle>
                        <DialogDescription asChild>
                            <div className="flex flex-col gap-1 pt-1 text-sm">
                                <span>
                                    <span className="font-medium text-foreground">{readTarget?.name}</span>{" "}
                                    <span className="text-muted-foreground">&lt;{readTarget?.email}&gt;</span>
                                </span>
                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                    <Calendar className="size-3" aria-hidden="true" />
                                    {formatDate(readTarget?.created_at ?? null)}
                                </span>
                            </div>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-80 overflow-y-auto space-y-3">
                        <div className="rounded-md border border-border bg-muted/40 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                            {readTarget?.message}
                        </div>

                        {readTarget?.is_replied && readTarget?.reply_message && (
                            <div className="rounded-md border border-primary/20 bg-primary/5 p-4">
                                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-primary">
                                    <ReplyIcon className="size-3" aria-hidden="true" />
                                    Admin reply
                                    {readTarget.replied_at && (
                                        <span className="font-normal text-muted-foreground">
                                            · {formatDate(readTarget.replied_at)}
                                        </span>
                                    )}
                                </div>
                                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {readTarget.reply_message}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:justify-between">
                        <Button
                            variant="ghost"
                            className="gap-1.5 text-destructive hover:text-destructive"
                            onClick={() => {
                                if (readTarget) requestDelete(readTarget)
                                setReadTarget(null)
                            }}
                        >
                            <Trash2 className="size-3.5" aria-hidden="true" />
                            Delete
                        </Button>
                        <div className="flex items-center gap-2">
                            {readTarget?.is_replied && (
                                <span className="text-xs text-muted-foreground">
                                    Replied {formatDate(readTarget.replied_at)}
                                </span>
                            )}
                            {!readTarget?.is_replied && (
                                <Button
                                    variant="outline"
                                    className="gap-1.5"
                                    onClick={() => {
                                        if (readTarget) openReply(readTarget)
                                        setReadTarget(null)
                                    }}
                                >
                                    <ReplyIcon className="size-3.5" aria-hidden="true" />
                                    {"Reply"}
                                </Button>
                            )}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reply compose dialog */}
            <Dialog open={Boolean(replyTarget)} onOpenChange={(open) => { if (!open) setReplyTarget(null) }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="font-heading">
                            Reply to {replyTarget?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Re: {replyTarget?.subject} · {replyTarget?.email}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Original message, kept visible for context while replying */}
                    <div className="max-h-40 overflow-y-auto rounded-md border border-border bg-muted/40 p-3 text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                        {replyTarget?.message}
                    </div>

                    <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your reply..."
                        rows={6}
                        className="resize-none"
                        autoFocus
                    />

                    <DialogFooter className="gap-2">
                        <Button variant="ghost" onClick={() => setReplyTarget(null)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSendReply}
                            disabled={!replyText.trim() || (isPending && isSendingReply)}
                        >
                            {isPending && isSendingReply ? "Sending…" : "Send Reply"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DeleteConfirmDialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => {
                    if (!open) setDeleteTarget(null)
                }}
                onConfirm={confirmDelete}
                title="Delete message"
                itemName={deleteTarget?.subject}
                isLoading={isPending && pendingDeleteId === deleteTarget?.id}
            />
        </div>
    )
}