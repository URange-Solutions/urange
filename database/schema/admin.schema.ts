import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { adminRoleEnum } from "./enums/adminRole";
import { unique } from "drizzle-orm/gel-core";

export const admins = pgTable("admins", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  avatar_url: text("avatar_url"),
  username: text("username").notNull().unique(),
  role: adminRoleEnum("role").notNull().default("admin"),
  last_login_at: timestamp("last_login_at", { mode: 'string' }),
  created_at: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export type AdminSchema = typeof admins.$inferSelect;