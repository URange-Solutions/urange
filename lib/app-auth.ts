import { eq } from "drizzle-orm"
import type { NextRequest } from "next/server"

import { db } from "@/database"
import { apps } from "@/database/schema/apps.schema"
import { verifySecret } from "./secret-hash"

export class ApiAuthError extends Error {
    status: number
    constructor(message: string, status = 401) {
        super(message)
        this.status = status
    }
}

export async function authenticateApp(req: NextRequest) {
    const apiKey = req.headers.get("x-api-key")
    const appId = req.headers.get("x-app-id")

    if (!apiKey || !appId) {
        throw new ApiAuthError("Missing x-api-key or x-app-id header", 401)
    }

    const [app] = await db
        .select()
        .from(apps)
        .where(eq(apps.id, appId))
        .limit(1)

    if (!app) {
        throw new ApiAuthError("App not found", 404)
    }

    if (!app.api_key_hash) {
        throw new ApiAuthError("App has no active API key — rotate one first", 401)
    }

    if (app.api_key_prefix && !apiKey.startsWith(app.api_key_prefix)) {
        throw new ApiAuthError("Invalid API key", 401)
    }

    if (!verifySecret(apiKey, app.api_key_hash)) {
        throw new ApiAuthError("Invalid API key", 401)
    }

    return app
}

export function authErrorResponse(err: unknown) {
    if (err instanceof ApiAuthError) {
        return { message: err.message, status: err.status }
    }
    throw err
}