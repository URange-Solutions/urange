import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database";
import { inboxMessages } from "@/database/schema";

export async function POST(req: NextRequest) {
    const secret = req.headers.get("x-resend-secret");

    if (secret !== process.env.RESEND_WEBHOOK_SECRET) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    const body = await req.json();

    const from = body.from ?? "";
    const subject = body.subject ?? "(No Subject)";
    const text = body.text ?? "";
    const html = body.html ?? "";

    const match = from.match(/(.*)<(.+)>/);

    const name = match?.[1]?.trim().replace(/^"|"$/g, "") || from;
    const email = match?.[2]?.trim() || from;

    await db.insert(inboxMessages).values({
        name,
        email,
        subject,
        message: text || html,
    });

    return NextResponse.json({ success: true });
}