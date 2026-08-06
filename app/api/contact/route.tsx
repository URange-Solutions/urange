import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database";
import { inboxMessages } from "@/database/schema";
import { rateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    const limiter = rateLimit(ip, 5, 60_000);

    if (!limiter.success) {
      return NextResponse.json(
        {
          message: "Too many requests. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(limiter.retryAfter),
          },
        }
      );
    }

    const body = await req.json();

    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        {
          message: "All fields are required.",
        },
        {
          status: 400,
        }
      );
    }

    await db.insert(inboxMessages).values({
      name,
      email,
      subject,
      message,
    });

    return NextResponse.json(
      {
        message: "Message sent successfully.",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Internal server error.",
      },
      {
        status: 500,
      }
    );
  }
}

// curl -X POST http://localhost:3000/api/contact -H "Content-Type: application/json" -d "{\"name\": \"Jan Liby Dela Costa\", \"email\": \"contact@libyzxy0.me\", \"subject\": \"Hello from curl\", \"message\": \"Testing the contact form\"}"