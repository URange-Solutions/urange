import { NextRequest, NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"

import { db } from "@/database"
import { payments } from "@/database/schema/payments.schema"
import { authenticateApp, authErrorResponse } from "@/lib/app-auth"

export async function GET(
    req: NextRequest,
    { params }: { params: { refNo: string } }
) {

    const { refNo } = await params;

    let app
    try {
        app = await authenticateApp(req)
    } catch (err) {
        const { message, status } = authErrorResponse(err)
        return NextResponse.json({ error: message }, { status })
    }

    const [payment] = await db
        .select()
        .from(payments)
        .where(and(eq(payments.ref_no, refNo), eq(payments.app_id, app.id)))
        .limit(1)

    if (!payment) {
        return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    return NextResponse.json({
        ref_no: payment.ref_no,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        description: payment.description,
        customer_email: payment.customer_email,
        customer_name: payment.customer_name,
        approved_at: payment.approved_at,
        decline_reason: payment.decline_reason,
        created_at: payment.created_at,
        updated_at: payment.updated_at,
    })
}