import { pgEnum } from "drizzle-orm/pg-core";

export const adminRoleEnum = pgEnum("admin_role", [
  "super_admin",
  "admin",
  "moderator"
]);