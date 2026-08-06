import { uuid, text, boolean, timestamp, pgTable } from "drizzle-orm/pg-core"

export const inboxMessages = pgTable("inbox_messages", {
    id: uuid("id").defaultRandom().primaryKey(),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow(),

    name: text("name").notNull(),
    email: text("email").notNull(),
    subject: text("subject").notNull(),
    message: text("message").notNull(),

    is_read: boolean("is_read").default(false).notNull(),

    is_replied: boolean("is_replied").default(false).notNull(),
    replied_at: timestamp("replied_at", { mode: "string", withTimezone: true }),
    reply_message: text("reply_message"),
})

export type InboxMessage = typeof inboxMessages.$inferSelect
export type NewInboxMessage = typeof inboxMessages.$inferInsert