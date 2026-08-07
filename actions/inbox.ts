"use server"

import { db } from "@/database"
import { inboxMessages } from "@/database/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);


const INBOX_PATH = "/admin/inbox"

export async function refreshInbox() {
    revalidatePath(INBOX_PATH)
}
export async function markMessageRead(id: string) {
    await db
        .update(inboxMessages)
        .set({ is_read: true, updated_at: new Date().toISOString() })
        .where(eq(inboxMessages.id, id))

    revalidatePath(INBOX_PATH)
}

export async function markMessageReplied(id: string) {
    await db
        .update(inboxMessages)
        .set({
            is_replied: true,
            replied_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .where(eq(inboxMessages.id, id))

    revalidatePath(INBOX_PATH)
}

export async function deleteMessage(id: string) {
    await db.delete(inboxMessages).where(eq(inboxMessages.id, id))
    revalidatePath(INBOX_PATH)
}

export async function sendReply({
    id,
    toEmail,
    toName,
    originalSubject,
    body,
}: {
    id: string
    toEmail: string
    toName: string
    originalSubject: string
    body: string
}) {
    console.log("sendReply", { toEmail, toName, originalSubject, body })
    await resend.emails.send({
        from: "URange Team <no-reply@urange.tech>",
        to: toEmail,
        subject: "Re: " + originalSubject,
        text: body,
    });

    await db
        .update(inboxMessages)
        .set({
            is_replied: true,
            replied_at: new Date().toISOString(),
            reply_message: body,
            updated_at: new Date().toISOString(),
        })
        .where(eq(inboxMessages.id, id))

    revalidatePath(INBOX_PATH)
}