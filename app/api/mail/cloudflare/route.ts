import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database";
import { inboxMessages } from "@/database/schema";

export async function POST(req: NextRequest) {
  const data = await req.json();

  await db.insert(inboxMessages).values({
    name: data.from,
    email: data.from,
    subject: data.subject,
    message: data.text,
  });

  return NextResponse.json({ success: true });
}