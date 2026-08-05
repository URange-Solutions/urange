import { relations } from "drizzle-orm";
import { admins } from "../admin.schema";
import { adminSessions } from "../adminsession.schema";

export const sessionRelations = relations(adminSessions, ({ one }) => ({
  admins: one(admins, {
    fields: [adminSessions.admin_id],
    references: [admins.id],
  }),
}));