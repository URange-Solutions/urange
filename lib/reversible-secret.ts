import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto"

/**
 * AES-256-GCM encrypt/decrypt for secrets that must be *readable again*
 * later (unlike API keys, which only ever need to be hashed-and-compared).
 *
 * Use this for `payments_webhook_secret_*` instead of a hash if you want
 * `sendPaymentWebhook` to actually be able to sign requests.
 *
 * Requires a 32-byte key in process.env.WEBHOOK_SECRET_ENCRYPTION_KEY,
 * base64-encoded. Generate one with:
 *   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 */

function getKey(): Buffer {
    const b64 = process.env.WEBHOOK_SECRET_ENCRYPTION_KEY
    if (!b64) {
        throw new Error("WEBHOOK_SECRET_ENCRYPTION_KEY is not set")
    }
    const key = Buffer.from(b64, "base64")

    console.log(key.length)
    if (key.length !== 32) {
        throw new Error("WEBHOOK_SECRET_ENCRYPTION_KEY must decode to exactly 32 bytes")
    }
    return key
}

export function encryptSecret(plaintext: string): string {
    const key = getKey()
    const iv = randomBytes(12)
    const cipher = createCipheriv("aes-256-gcm", key, iv)

    const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
    const authTag = cipher.getAuthTag()

    return [iv.toString("base64"), authTag.toString("base64"), ciphertext.toString("base64")].join(":")
}

export function decryptSecret(stored: string): string {
    const key = getKey()
    const [ivB64, authTagB64, ciphertextB64] = stored.split(":")

    if (!ivB64 || !authTagB64 || !ciphertextB64) {
        throw new Error("Malformed encrypted secret")
    }

    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64"))
    decipher.setAuthTag(Buffer.from(authTagB64, "base64"))

    const plaintext = Buffer.concat([
        decipher.update(Buffer.from(ciphertextB64, "base64")),
        decipher.final(),
    ])

    return plaintext.toString("utf8")
}