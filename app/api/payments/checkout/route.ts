import { randomBytes } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/database"
import { payments } from "@/database/schema/payments.schema"
import { paymentChannels } from "@/database/schema/paymentChannels.schema"
import { authenticateApp, authErrorResponse } from "@/lib/app-auth"

const checkoutSchema = z.object({
    amount: z.number().positive(),
    description: z.string().min(1).max(500),
    currency: z.string().length(3).optional().default("PHP"),
    customerEmail: z.string().email().optional(),
    customerName: z.string().min(1).max(200).optional(),
    payload: z.record(z.string(), z.unknown()).optional(),
})

function generateRefNo() {
    const stamp = Date.now().toString(36).toUpperCase()
    const random = randomBytes(5).toString("hex").toUpperCase()
    return `URG-${stamp}-${random}`
}

export async function POST(req: NextRequest) {
    let app
    try {
        app = await authenticateApp(req)
    } catch (err) {
        const { message, status } = authErrorResponse(err)
        return NextResponse.json({ error: message }, { status })
    }

    const body = await req.json().catch(() => null)

    const parsed = checkoutSchema.safeParse(body)
    console.log(parsed);

    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid request body", details: parsed.error.flatten() },
            { status: 400 }
        )
    }

    const { amount, description, currency, customerEmail, customerName, payload } = parsed.data;

    const channels = await db
        .select({
            id: paymentChannels.id,
            channel_name: paymentChannels.channel_name,
            label: paymentChannels.label,
            account_name: paymentChannels.account_name,
            account_number: paymentChannels.account_number,
            qr_code_url: paymentChannels.qr_code_url,
        })
        .from(paymentChannels)
        .where(eq(paymentChannels.app_id, app.id))

    const ref_no = generateRefNo()


    const [payment] = await db
        .insert(payments)
        .values({
            app_id: app.id,
            ref_no,
            description,
            amount: amount.toFixed(2),
            currency,
            proof_file_url: "",
            proof_file_type: "",
            status: "unpaid",
            customer_email: customerEmail ?? null,
            customer_name: customerName ?? null,
            payload: payload ?? {},
        })
        .returning()

    const baseUrl = process.env.APP_PUBLIC_URL ?? new URL(req.url).origin
    const checkout_url = `${baseUrl}/payments/checkout/${payment.ref_no}`

    return NextResponse.json(
        {
            ref_no: payment.ref_no,
            checkout_url,
            amount: payment.amount,
            currency: payment.currency,
            description: payment.description,
            status: payment.status,
            customer_email: payment.customer_email,
            customer_name: payment.customer_name,
            payment_channels: channels,
            created_at: payment.created_at,
        },
        { status: 201 }
    )
}

//  curl.exe -X POST "http://localhost:3000/api/payments/checkout" -H "Content-Type: application/json" -H "x-api-key: sk_live_257b3d806e697bc0872e3004030da5776eb918c6faea9a8e" -H "x-app-id: 748eaf04-8cff-4f5b-a836-2187fd87c28c" -d '{"amount":150.00,"description":"Test payment","currency":"PHP","customerEmail":"test@example.com","customerName":"Juan Dela Cruz","payload":{"orderId":"TEST-001","product":"Sample Product"}}'