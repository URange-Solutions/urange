import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/database";
import { inboxMessages } from "@/database/schema";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const event = await req.json();

  if (event.type !== "email.received") {
    return NextResponse.json({ success: true });
  }

  const { data: email } = await resend.emails.receiving.get(
    event.data.email_id
  );

  const from = event.data.from;
  const subject = event.data.subject ?? "(No Subject)";

  await db.insert(inboxMessages).values({
    name: from,
    email: from,
    subject,
    message: email?.text || email?.html || "(No content)",
  });

  return NextResponse.json({ success: true });
}