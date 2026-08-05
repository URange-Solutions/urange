import { db } from "@/database";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { AdminSession, adminSessions } from "@/database/schema/adminsession.schema";
import { AdminSchema } from "@/database/schema";
import { getAdminSessionCookie } from "./session";

export type AdminAuthSession = AdminSession & {
    admins: AdminSchema;
} | null;

export async function getAdminSession(): Promise<AdminAuthSession> {
    const token = await getAdminSessionCookie();

    if (!token) return null;

    const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    try {
        const result = await db.query.adminSessions.findFirst({
            where: eq(adminSessions.token_hash, tokenHash),
            with: {
                admins: true
            }
        })

        if (!result) return null;

        return result;
    } catch {
        return null;
    }
}