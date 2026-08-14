import { createHash, timingSafeEqual } from "node:crypto"

export function hashSecret(plaintext: string): string {
    return createHash("sha256").update(plaintext).digest("hex")
}

export function verifySecret(plaintext: string, storedHash: string): boolean {
    const incomingHash = hashSecret(plaintext)

    const a = Buffer.from(incomingHash, "hex")
    const b = Buffer.from(storedHash, "hex")

    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
}