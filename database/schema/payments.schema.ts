import { pgTable, uuid, text, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";
import { paymentStatusEnum } from "./enums/paymentStatus";
import { admins } from "./admin.schema";
import { apps } from "./apps.schema";
import { paymentChannels } from "./paymentChannels.schema";

export const payments = pgTable("payments", {
    id: uuid("id").primaryKey().defaultRandom(),
    app_id: uuid("app_id")
        .references(() => apps.id, { onDelete: "set null" }),
    payment_channel_id: uuid("payment_channel_id")
        .references(() => paymentChannels.id, { onDelete: "set null" }),
    ref_no: text("ref_no").notNull().unique(),
    description: text("description").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("PHP"),
    proof_file_url: text("proof_file_url").notNull(),
    proof_file_type: text("proof_file_type").notNull(),
    status: paymentStatusEnum("status").notNull().default("unpaid"),
    approved_by: uuid("approved_by").references(() => admins.id, { onDelete: "set null" }),
    approved_at: timestamp("approved_at", { mode: "string" }),
    paid_at: timestamp("paid_at", { mode: "string" }),
    decline_reason: text("decline_reason"),
    customer_email: text("customer_email"),
    customer_name: text("customer_name"),
    payload: jsonb("payload").$type<Record<string, unknown>>().default({}),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow(),
});

export type Payment = typeof payments.$inferSelect;