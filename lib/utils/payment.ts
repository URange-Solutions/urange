export type PaymentWebhookEvent = "payment.success" | "payment.failed"

export type PaymentWebhookPayload = {
    event: PaymentWebhookEvent
    ref_no: string
    app_id: string
    status: string
    amount: string
    currency: string
    description: string
    customer_email: string | null
    customer_name: string | null
    approved_at: string | null
    decline_reason: string | null
    timestamp: string
    payload: any
}

type SendWebhookResult =
    | { delivered: true; status: number; attempts: number }
    | { delivered: false; status: number | null; attempts: number; error: string }

const MAX_ATTEMPTS = 3
const TIMEOUT_MS = 8000
const RETRY_BASE_DELAY_MS = 500

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

type WebhookTarget = {
    url: string
    secret: string
}

async function deliver(target: WebhookTarget, payload: PaymentWebhookPayload): Promise<SendWebhookResult> {
    const rawBody = JSON.stringify(payload)

    console.log(target, payload)

    let lastError = "Unknown error"
    let lastStatus: number | null = null

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

        try {
            const res = await fetch(target.url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-webhook-secret": target.secret,
                    "x-webhook-event": payload.event,
                },
                body: rawBody,
                signal: controller.signal,
            })

            clearTimeout(timeout)
            lastStatus = res.status

            if (res.ok) {
                return { delivered: true, status: res.status, attempts: attempt }
            }

            lastError = `Received HTTP ${res.status}`
        } catch (err) {
            clearTimeout(timeout)
            lastError = err instanceof Error ? err.message : "Request failed"
        }

        if (attempt < MAX_ATTEMPTS) {
            await sleep(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1))
        }
    }

    return { delivered: false, status: lastStatus, attempts: MAX_ATTEMPTS, error: lastError }
}

type AppWebhookConfig = {
    id: string
    payments_callback_url: string | null
    payments_success_url: string | null
    payments_failure_url: string | null
}

type PaymentForWebhook = {
    ref_no: string
    status: string
    amount: string
    currency: string
    description: string
    customer_email: string | null
    customer_name: string | null
    approved_at: string | null
    decline_reason: string | null
    payload: any
}

export async function sendPaymentWebhook(
    app: AppWebhookConfig,
    payment: PaymentForWebhook,
    event: PaymentWebhookEvent,
    webhookSecret: string | null
): Promise<SendWebhookResult> {
    const url =
        app.payments_callback_url;

    if (!url) {
        return {
            delivered: false,
            status: null,
            attempts: 0,
            error: "No callback/success/failure URL configured for this app",
        }
    }

    if (!webhookSecret) {
        return {
            delivered: false,
            status: null,
            attempts: 0,
            error: "No webhook secret available to sign the payload",
        }
    }

    const payload: PaymentWebhookPayload = {
        event,
        ref_no: payment.ref_no,
        app_id: app.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        description: payment.description,
        customer_email: payment.customer_email,
        customer_name: payment.customer_name,
        approved_at: payment.approved_at,
        decline_reason: payment.decline_reason,
        timestamp: new Date().toISOString(),
        payload: payment.payload,
    }

    return deliver({ url, secret: webhookSecret }, payload)
}