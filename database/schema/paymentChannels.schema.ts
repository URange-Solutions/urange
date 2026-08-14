import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { apps } from "./apps.schema";

export const paymentChannels = pgTable(
    "payment_channels",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        app_id: uuid("app_id")
            .notNull()
            .references(() => apps.id, { onDelete: "cascade" }),
        channel_name: text("channel_name").notNull(),
        label: text("label").notNull(),
        subtitle: text("subtitle"),
        account_name: text("account_name").notNull(),
        account_number: text("account_number").notNull(),
        qr_code_url: text("qr_code_url"),
        is_active: boolean("is_active").notNull().default(true),
        created_at: timestamp("created_at", { mode: "string" }).defaultNow(),
    }
);