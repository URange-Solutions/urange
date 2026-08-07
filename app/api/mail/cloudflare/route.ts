import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database";
import { inboxMessages } from "@/database/schema";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");

  const expected = `Bearer ${process.env.CFMAIL_WEBHOOK_SECRET}`;

  if (auth !== expected) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const data = await req.json();

  await db.insert(inboxMessages).values({
    name: data.from?.name || data.from?.address || "Unknown",
    email: data.from?.address || "",
    subject: data.subject || "(No Subject)",
    message: data.text || "",
  });

  return NextResponse.json({ success: true });
}