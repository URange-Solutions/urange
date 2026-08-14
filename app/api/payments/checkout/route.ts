import { randomBytes } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { db } from "@/database"
import { payments } from "@/database/schema/payments.schema"
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
            app_name: app.name,
            ref_no: payment.ref_no,
            checkout_url,
            amount: payment.amount,
            currency: payment.currency,
            description: payment.description,
            customer_email: payment.customer_email,
            customer_name: payment.customer_name,
            created_at: payment.created_at,
        },
        { status: 201 }
    )
}