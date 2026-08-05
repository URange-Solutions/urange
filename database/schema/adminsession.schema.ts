import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { admins } from "./admin.schema";

export const adminSessions = pgTable("admin_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  admin_id: uuid("user_id").notNull().references(() => admins.id, { onDelete: "cascade" }),
  token_hash: text("token_hash").notNull(),
  expires_at: timestamp("expires_at", { mode: 'string' }).notNull(),
  created_at: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export type AdminSession = typeof adminSessions.$inferSelect; 