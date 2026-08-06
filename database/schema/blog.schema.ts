import { pgTable, uuid, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { admins } from "./admin.schema";

export const blogs = pgTable("blogs", {
  id: uuid("id").primaryKey().defaultRandom(),
  author_id: uuid("author_id").notNull().references(() => admins.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull().unique(),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  is_draft: boolean('is_draft').default(false),
  title: text("title").notNull(),
  description: text("description"),
  banner_url: text("banner_url"),
  updated_at: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  created_at: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export type BlogSchema = typeof blogs.$inferSelect;