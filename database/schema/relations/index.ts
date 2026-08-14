import { relations } from "drizzle-orm";
import { admins } from "../admin.schema";
import { adminSessions } from "../adminsession.schema";
import { blogs } from "../blog.schema";
import { payments } from "../payments.schema";
import { paymentChannels } from "../paymentChannels.schema";
import { apps } from "../apps.schema";

export const sessionRelations = relations(adminSessions, ({ one }) => ({
  admins: one(admins, {
    fields: [adminSessions.admin_id],
    references: [admins.id],
  }),
}));

export const adminRelations = relations(admins, ({ many }) => ({
  blogs: many(blogs),
}));


export const adminsRelations = relations(admins, ({ many }) => ({
    apps: many(apps),
    approvedPayments: many(payments),
}));

export const appsRelations = relations(apps, ({ one, many }) => ({
    admin: one(admins, {
        fields: [apps.admin_id],
        references: [admins.id],
    }),
    paymentChannels: many(paymentChannels),
    payments: many(payments),
}));

export const paymentChannelsRelations = relations(paymentChannels, ({ one, many }) => ({
    app: one(apps, {
        fields: [paymentChannels.app_id],
        references: [apps.id],
    }),
    payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
    app: one(apps, {
        fields: [payments.app_id],
        references: [apps.id],
    }),
    paymentChannel: one(paymentChannels, {
        fields: [payments.payment_channel_id],
        references: [paymentChannels.id],
    }),
    approvedByAdmin: one(admins, {
        fields: [payments.approved_by],
        references: [admins.id],
    }),
}));

export const blogRelations = relations(blogs, ({ one }) => ({
  author: one(admins, {
    fields: [blogs.author_id],
    references: [admins.id],
  }),
}));

