import { cookies } from "next/headers";
import crypto from "crypto";

export function createSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}
export async function setAdminSessionCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getAdminSessionCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value ?? null;
}