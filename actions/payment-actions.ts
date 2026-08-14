"use server"

import { revalidatePath } from "next/cache"
import { eq, inArray } from "drizzle-orm"
import { z } from "zod"
import { db } from "@/database"
import { payments } from "@/database/schema"
import { getAdminSession } from "@/lib/auth"
import { notifyWebhook } from "@/lib/utils/payment"

const PAYMENTS_PATH = "/dashboard/admin/payments"

type ActionResult = { success: true; message?: string } | { success: false; error: string }

async function getEligiblePendingIds(paymentIds: string[]) {
    const rows = await db
        .select({ id: payments.id, status: payments.status })
        .from(payments)
        .where(inArray(payments.id, paymentIds))

    return rows.filter((r) => r.status === "pending").map((r) => r.id)
}

const idSchema = z.string().uuid("Invalid payment id.")
const idsSchema = z.array(z.string().uuid("Invalid payment id.")).min(1, "No payments selected.")

export async function approvePayment(paymentId: string): Promise<ActionResult> {
    const parsedId = idSchema.safeParse(paymentId)
    if (!parsedId.success) {
        return { success: false, error: "Invalid payment id." }
    }

    try {
        const session = await getAdminSession()
        if (!session?.admin_id) return { success: false, error: "You must be signed in to do this." }

        await db.transaction(async (tx) => {
            const [existing] = await tx
                .select({ status: payments.status })
                .from(payments)
                .where(eq(payments.id, parsedId.data))
                .limit(1)

            if (!existing) {
                throw new Error("Payment not found.")
            }
            if (existing.status !== "pending") {
                throw new Error(`This payment is already ${existing.status}.`)
            }

            const [updated] = await tx
                .update(payments)
                .set({
                    status: "approved",
                    approved_at: new Date().toISOString(),
                    decline_reason: null,
                    approved_by: session.admin_id,
                    updated_at: new Date().toISOString(),
                })
                .where(eq(payments.id, parsedId.data))
                .returning()

            if (!updated) {
                throw new Error("Payment not found.")
            }

            const webhookResult = await notifyWebhook(updated, "payment.confirmed")
            if (!webhookResult.delivered) {
                throw new Error(`Approval was not saved because the webhook failed: ${webhookResult.error}`)
            }
        })

        revalidatePath(PAYMENTS_PATH)
        return { success: true }
    } catch (error) {
        console.error("approvePayment error:", error)
        const message = error instanceof Error ? error.message : "Something went wrong while approving this payment."
        return { success: false, error: message }
    }
}

const declineSchema = z.object({
    paymentId: z.string().uuid("Invalid payment id."),
    reason: z
        .string()
        .trim()
        .min(5, "Please provide a more detailed reason (at least 5 characters).")
        .max(500, "Reason is too long."),
})

export async function declinePayment(paymentId: string, reason: string): Promise<ActionResult> {
    const parsed = declineSchema.safeParse({ paymentId, reason })
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." }
    }

    try {
        await db.transaction(async (tx) => {
            const [existing] = await tx
                .select({ status: payments.status })
                .from(payments)
                .where(eq(payments.id, parsed.data.paymentId))
                .limit(1)

            if (!existing) {
                throw new Error("Payment not found.")
            }
            if (existing.status !== "pending") {
                throw new Error(`This payment is already ${existing.status}.`)
            }

            const [updated] = await tx
                .update(payments)
                .set({
                    status: "declined",
                    decline_reason: parsed.data.reason,
                    approved_at: null,
                    updated_at: new Date().toISOString(),
                })
                .where(eq(payments.id, parsed.data.paymentId))
                .returning()

            if (!updated) {
                throw new Error("Payment not found.")
            }

            const webhookResult = await notifyWebhook(updated, "payment.declined")
            if (!webhookResult.delivered) {
                throw new Error(`Decline was not saved because the webhook failed: ${webhookResult.error}`)
            }
        })

        revalidatePath(PAYMENTS_PATH)
        return { success: true }
    } catch (error) {
        console.error("declinePayment error:", error)
        const message = error instanceof Error ? error.message : "Something went wrong while declining this payment."
        return { success: false, error: message }
    }
}

export async function deletePayment(paymentId: string): Promise<ActionResult> {
    const parsedId = idSchema.safeParse(paymentId)
    if (!parsedId.success) {
        return { success: false, error: "Invalid payment id." }
    }

    try {
        const deleted = await db
            .delete(payments)
            .where(eq(payments.id, parsedId.data))
            .returning({ id: payments.id })

        if (deleted.length === 0) {
            return { success: false, error: "Payment not found." }
        }

        revalidatePath(PAYMENTS_PATH)
        return { success: true }
    } catch (error) {
        console.error("deletePayment error:", error)
        return { success: false, error: "Something went wrong while deleting this payment." }
    }
}

export async function bulkApprovePayments(paymentIds: string[]): Promise<ActionResult> {
    const parsed = idsSchema.safeParse(paymentIds)
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." }
    }

    try {
        const session = await getAdminSession()
        if (!session?.admin_id) return { success: false, error: "You must be signed in to do this." }

        const pendingIds = await getEligiblePendingIds(parsed.data)
        if (pendingIds.length === 0) {
            return { success: false, error: "None of the selected payments are pending." }
        }

        let approvedCount = 0
        let webhookFailures = 0

        for (const id of pendingIds) {
            try {
                await db.transaction(async (tx) => {
                    const [updated] = await tx
                        .update(payments)
                        .set({
                            status: "approved",
                            approved_at: new Date().toISOString(),
                            decline_reason: null,
                            approved_by: session.admin_id,
                            updated_at: new Date().toISOString(),
                        })
                        .where(eq(payments.id, id))
                        .returning()

                    if (!updated) throw new Error("Payment not found.")

                    const webhookResult = await notifyWebhook(updated, "payment.confirmed")
                    if (!webhookResult.delivered) {
                        throw new Error(webhookResult.error)
                    }
                })
                approvedCount++
            } catch (err) {
                webhookFailures++
                console.error(`bulkApprovePayments: failed to approve ${id}:`, err)
            }
        }

        revalidatePath(PAYMENTS_PATH)

        if (approvedCount === 0) {
            return { success: false, error: "No payments were approved; all webhook deliveries failed." }
        }

        return {
            success: true,
            message:
                webhookFailures > 0
                    ? `${approvedCount} of ${pendingIds.length} payment(s) approved (${webhookFailures} failed due to webhook errors).`
                    : pendingIds.length < parsed.data.length
                        ? `${approvedCount} of ${parsed.data.length} payment(s) approved (others were not pending).`
                        : undefined,
        }
    } catch (error) {
        console.error("bulkApprovePayments error:", error)
        return { success: false, error: "Something went wrong while approving these payments." }
    }
}

const bulkDeclineSchema = z.object({
    paymentIds: idsSchema,
    reason: z
        .string()
        .trim()
        .min(5, "Please provide a more detailed reason (at least 5 characters).")
        .max(500, "Reason is too long."),
})

export async function bulkDeclinePayments(paymentIds: string[], reason: string): Promise<ActionResult> {
    const parsed = bulkDeclineSchema.safeParse({ paymentIds, reason })
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." }
    }

    try {
        const pendingIds = await getEligiblePendingIds(parsed.data.paymentIds)
        if (pendingIds.length === 0) {
            return { success: false, error: "None of the selected payments are pending." }
        }

        let declinedCount = 0
        let webhookFailures = 0

        for (const id of pendingIds) {
            try {
                await db.transaction(async (tx) => {
                    const [updated] = await tx
                        .update(payments)
                        .set({
                            status: "declined",
                            decline_reason: parsed.data.reason,
                            approved_at: null,
                            updated_at: new Date().toISOString(),
                        })
                        .where(eq(payments.id, id))
                        .returning()

                    if (!updated) throw new Error("Payment not found.")

                    const webhookResult = await notifyWebhook(updated, "payment.declined")
                    if (!webhookResult.delivered) {
                        throw new Error(webhookResult.error)
                    }
                })
                declinedCount++
            } catch (err) {
                webhookFailures++
                console.error(`bulkDeclinePayments: failed to decline ${id}:`, err)
            }
        }

        revalidatePath(PAYMENTS_PATH)

        if (declinedCount === 0) {
            return { success: false, error: "No payments were declined; all webhook deliveries failed." }
        }

        return {
            success: true,
            message:
                webhookFailures > 0
                    ? `${declinedCount} of ${pendingIds.length} payment(s) declined (${webhookFailures} failed due to webhook errors).`
                    : pendingIds.length < parsed.data.paymentIds.length
                        ? `${declinedCount} of ${parsed.data.paymentIds.length} payment(s) declined (others were not pending).`
                        : undefined,
        }
    } catch (error) {
        console.error("bulkDeclinePayments error:", error)
        return { success: false, error: "Something went wrong while declining these payments." }
    }
}

interface SubmitPaymentProofInput {
    refNo: string;
    paymentChannelId: string;
    proofFileUrl: string;
    proofFileType: string;
}

interface SubmitPaymentProofResult {
    success: boolean;
    error?: string;
}

export async function submitPaymentProof(
    input: SubmitPaymentProofInput
): Promise<SubmitPaymentProofResult> {
    const { refNo, paymentChannelId, proofFileUrl, proofFileType } = input;
 
    if (!refNo || !paymentChannelId || !proofFileUrl || !proofFileType) {
        return { success: false, error: "Missing required fields." };
    }
 
    try {
        const existing = await db.query.payments.findFirst({
            where: eq(payments.ref_no, refNo),
            columns: { id: true, status: true },
        });
 
        if (!existing) {
            return { success: false, error: "Payment not found." };
        }
 
        if (existing.status !== "unpaid") {
            return { success: false, error: "This payment has already been submitted." };
        }
 
        await db.transaction(async (tx) => {
            const [updated] = await tx
                .update(payments)
                .set({
                    payment_channel_id: paymentChannelId,
                    proof_file_url: proofFileUrl,
                    proof_file_type: proofFileType,
                    status: "pending",
                    updated_at: new Date().toISOString(),
                    paid_at: new Date().toISOString()
                })
                .where(eq(payments.ref_no, refNo))
                .returning();
 
            if (!updated) {
                throw new Error("Payment not found.");
            }
 
            const webhookResult = await notifyWebhook(updated, "payment.paid");
            if (!webhookResult.delivered) {
                throw new Error(`Submission was not saved because the webhook failed: ${webhookResult.error}`);
            }
        });
 
        revalidatePath(`/payments/checkout/${refNo}`);
 
        return { success: true };
    } catch (error) {
        console.error("submitPaymentProof error:", error);
        return { success: false, error: "Something went wrong. Please try again." };
    }
}