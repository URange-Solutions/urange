import { relations } from "drizzle-orm";
import { admins } from "../admin.schema";
import { blogs } from "../blog.schema";

export const blogRelations = relations(blogs, ({ one }) => ({
  author: one(admins, {
    fields: [blogs.author_id],
    references: [admins.id],
  }),
}));

