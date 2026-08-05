"use server";

import { db } from "@/database";
import { admins, adminSessions } from "@/database/schema";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, setAdminSessionCookie } from "@/lib/session";
import crypto from "crypto";
import { eq, or } from "drizzle-orm";
import { redirect } from "next/navigation";

type FieldErrors = Partial<Record<"username" | "password", string>>;

type LoginResult = {
    fieldErrors?: FieldErrors;
    error?: string;
} | null;

async function verifyTurnstileToken(token: string): Promise<boolean> {
    try {
        const res = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    secret: process.env.CLOUDFLARE_TURNSTILE_SECRET as string,
                    response: token,
                }),
            }
        );

        const data = await res.json();
        return data.success === true;
    } catch (error) {
        console.error("Turnstile verification failed:", error);
        return false;
    }
}

export async function login(
    _prevState: LoginResult,
    formData: FormData
): Promise<LoginResult> {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const turnstileToken = formData.get("turnstileToken") as string;

    const fieldErrors: FieldErrors = {};

    if (!username) fieldErrors.username = "Username is required.";
    if (!password) fieldErrors.password = "Password is required.";
    if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

    if (!turnstileToken) {
        return { error: "Verification challenge is missing. Please try again." };
    }

    const isHuman = await verifyTurnstileToken(turnstileToken);
    if (!isHuman) {
        return { error: "Verification failed. Please complete the challenge again." };
    }

    let token: string;

    try {
        const admin = await db.query.admins.findFirst({
            where: or(eq(admins.username, username), eq(admins.email, username))
        });

        if (!admin) return { fieldErrors: { username: "No account found with this username." } };

        const valid = await verifyPassword(admin.password_hash, password);
        if (!valid) return { fieldErrors: { password: "Incorrect password." } };

        token = createSessionToken();
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        await db.insert(adminSessions).values({
            admin_id: admin.id,
            token_hash: tokenHash,
            expires_at: new Date(
                Date.now() + 1000 * 60 * 60 * 24 * 7
            ).toISOString(),
        });
        await setAdminSessionCookie(token);
    } catch (error) {
        console.error(error);
        return { error: "Something went wrong. Please try again later." };
    }

    redirect("/admin");
}