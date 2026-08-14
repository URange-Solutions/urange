import { AppsGrid } from "@/components/dashboard/admin/apps-grid"
import { db } from "@/database"

export default async function Apps() {
    const rows = await db.query.apps.findMany({
        with: { paymentChannels: true },
    })

    const apps = rows.map((app) => ({
        id: app.id,
        name: app.name,
        slug: app.slug,
        description: app.description ?? "",
        color: app.color,
        apiKeyPrefix: app.api_key_prefix,
        apiKeyLastRotatedAt: app.api_key_last_rotated_at,
        payment: {
            channels: app.paymentChannels.map((c) => ({
                id: c.id,
                name: c.channel_name,
                accountName: c.account_name,
                accountNumber: c.account_number,
                qrImageUrl: c.qr_code_url ?? undefined,
            })),
            callbackUrl: app.payments_callback_url ?? "",
            successUrl: app.payments_success_url ?? "",
            failureUrl: app.payments_failure_url ?? "",
            webhookSecretPrefix: app.payments_webhook_secret_prefix,
            webhookSecretLastRotatedAt: app.payments_webhook_secret_last_rotated_at,
        },
    }))

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <header className="mt-6 mx-6">
                    <h1 className="font-heading text-2xl font-bold">Apps Integration</h1>
                    <p className="text-muted-foreground">
                        Configure integrations for each app on UrangeSys.
                    </p>
                </header>
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <AppsGrid data={apps} />
                </div>
            </div>
        </div>
    )
}