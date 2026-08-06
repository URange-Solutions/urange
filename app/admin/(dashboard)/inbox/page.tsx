import { inboxMessages } from "@/database/schema";
import InboxManagementPage from "./InboxManagementPage"
import { and, desc, eq, ilike, or } from "drizzle-orm"
import { db } from "@/database";

type StatusFilter = "all" | "unread" | "read" | "replied"

interface PageProps {
    searchParams: Promise<{ q?: string; status?: string }>
}

export default async function Page({ searchParams }: PageProps) {
    const params = await searchParams
    const query = params.q ?? ""
    const status: StatusFilter =
        params.status === "unread" || params.status === "read" || params.status === "replied"
            ? params.status
            : "all"

    const conditions = []
    if (status === "unread") conditions.push(eq(inboxMessages.is_read, false))
    if (status === "read") conditions.push(eq(inboxMessages.is_read, true))
    if (status === "replied") conditions.push(eq(inboxMessages.is_replied, true))

    if (query) {
        const q = `%${query}%`
        conditions.push(
            or(
                ilike(inboxMessages.name, q),
                ilike(inboxMessages.email, q),
                ilike(inboxMessages.subject, q),
                ilike(inboxMessages.message, q)
            )
        )
    }

    const rows = await db
        .select()
        .from(inboxMessages)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(inboxMessages.created_at))

    const messages = rows.map((m) => ({
        id: m.id,
        created_at: m.created_at,
        name: m.name,
        email: m.email,
        subject: m.subject,
        message: m.message,
        is_read: m.is_read,
        is_replied: m.is_replied,
        replied_at: m.replied_at,
        reply_message: m.reply_message,
    }))

    return (
        <InboxManagementPage
            messages={messages}
            initialQuery={query}
            initialStatus={status}
        />
    )
}