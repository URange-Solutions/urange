"use server"

import { randomBytes, randomUUID } from "node:crypto"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"

import { db } from "@/database"
import { apps } from "@/database/schema/apps.schema"
import { hashSecret } from "@/lib/secret-hash"
import { paymentChannels } from "@/database/schema"
import { encryptSecret } from "@/lib/reversible-secret"

const APPS_PATH = "/admin/apps"

function generateSecret(prefix: string) {
    const random = randomBytes(24).toString("hex")
    return `${prefix}_${random}`
}

export async function rotateApiKey(appId: string) {
    const plaintext = generateSecret("sk_live")
    const prefix = plaintext.slice(0, 11)

    // API keys only ever need to be *verified*, never read back — hashing
    // (one-way) is correct here.
    await db
        .update(apps)
        .set({
            api_key_hash: hashSecret(plaintext),
            api_key_prefix: prefix,
            api_key_last_rotated_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .where(eq(apps.id, appId))

    revalidatePath(APPS_PATH)

    return { plaintext, prefix }
}

type PaymentConfigInput = {
    callbackUrl: string
    successUrl: string
    failureUrl: string
}

export async function savePaymentConfig(appId: string, input: PaymentConfigInput) {
    await db
        .update(apps)
        .set({
            payments_callback_url: input.callbackUrl || null,
            payments_success_url: input.successUrl || null,
            payments_failure_url: input.failureUrl || null,
            updated_at: new Date().toISOString(),
        })
        .where(eq(apps.id, appId))

    revalidatePath(APPS_PATH)
}

export async function rotateWebhookSecret(appId: string) {
    const plaintext = generateSecret("whsec")
    const prefix = plaintext.slice(0, 11)

    await db
        .update(apps)
        .set({
            payments_webhook_secret_hash: encryptSecret(plaintext),
            payments_webhook_secret_prefix: prefix,
            payments_webhook_secret_last_rotated_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .where(eq(apps.id, appId))

    revalidatePath(APPS_PATH)

    return { plaintext, prefix }
}

type AddChannelInput = {
    name: string
    accountName: string
    accountNumber: string
    qrImageUrl?: string
}

export async function addPaymentChannel(appId: string, input: AddChannelInput) {
    const [row] = await db
        .insert(paymentChannels)
        .values({
            id: randomUUID(),
            app_id: appId,
            channel_name: input.name,
            label: input.name,
            account_name: input.accountName,
            account_number: input.accountNumber,
            qr_code_url: input.qrImageUrl ?? null,
        })
        .returning()

    revalidatePath(APPS_PATH)
    return row
}

export async function removePaymentChannel(appId: string, channelId: string) {
    await db
        .delete(paymentChannels)
        .where(eq(paymentChannels.id, channelId))

    revalidatePath(APPS_PATH)
}

export async function createApp(input: { name: string; slug: string; description: string; color: string }) {
    const [row] = await db
        .insert(apps)
        .values({
            id: randomUUID(),
            name: input.name,
            slug: input.slug,
            description: input.description || null,
            color: input.color,
        })
        .returning()

    revalidatePath(APPS_PATH)
    return row
}

export async function removeApp(appId: string) {
    await db.delete(apps).where(eq(apps.id, appId))
    revalidatePath(APPS_PATH)
}