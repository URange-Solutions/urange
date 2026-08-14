import { pgTable, uuid, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { admins } from "./admin.schema";

export const apps = pgTable("apps", {
  id: uuid("id").primaryKey().defaultRandom(),
  admin_id: uuid("admin_id").references(() => admins.id, { onDelete: "set null" }),

  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  color: text("color").notNull().default("#6366F1"),

  api_key_hash: text("api_key_hash"),
  api_key_prefix: text("api_key_prefix"),
  api_key_last_rotated_at: timestamp("api_key_last_rotated_at", { mode: "string" }),

  payments_callback_url: text("payments_callback_url"),
  payments_success_url: text("payments_success_url"),
  payments_failure_url: text("payments_failure_url"),
  payments_webhook_secret_hash: text("payments_webhook_secret_hash"),
  payments_webhook_secret_prefix: text("payments_webhook_secret_prefix"),
  payments_webhook_secret_last_rotated_at: timestamp("payments_webhook_secret_last_rotated_at", { mode: "string" }),

  created_at: timestamp("created_at", { mode: "string" }).defaultNow(),
  updated_at: timestamp("updated_at", { mode: "string" }).defaultNow(),
});