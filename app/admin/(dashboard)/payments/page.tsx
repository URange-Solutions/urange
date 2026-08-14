// app/(dashboard)/admin/payments/page.tsx
import { PaymentsTable } from "@/components/dashboard/admin/payments-table"
import { PaymentsStatsCards } from "@/components/dashboard/admin/payments-cards"
import { db } from "@/database"
import { Payment, payments } from "@/database/schema/payments.schema"
import { count, eq, sql } from "drizzle-orm"

type SearchParams = {
    page?: string
    pageSize?: string
    status?: string
}

export default async function PaymentPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const params = await searchParams
    const page = Math.max(1, Number(params.page) || 1)
    const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 10))
    const status = params.status && params.status !== "all" ? params.status : undefined

    const whereClause = status ? eq(payments.status, status as any) : undefined

    const [rows, totalResult, statsResult] = await Promise.all([
        db.query.payments.findMany({
            where: whereClause,
            with: { paymentChannel: true, app: true },
            orderBy: (payments, { desc }) => [desc(payments.created_at)],
            limit: pageSize,
            offset: (page - 1) * pageSize,
        }),
        db.select({ value: count() }).from(payments).where(whereClause),
        db
            .select({
                totalRevenue: sql<string>`coalesce(sum(${payments.amount}) filter (where ${payments.status} = 'approved'), 0)`,
                pendingCount: count(sql`case when ${payments.status} = 'pending' then 1 end`),
                approvedToday: count(
                    sql`case when ${payments.status} = 'approved' and ${payments.approved_at}::date = current_date then 1 end`
                ),
                rejectedToday: count(
                    sql`case when ${payments.status} = 'declined' and ${payments.updated_at}::date = current_date then 1 end`
                ),
                totalCompleted: count(sql`case when ${payments.status} = 'approved' then 1 end`),
                totalRejected: count(sql`case when ${payments.status} = 'declined' then 1 end`),
            })
            .from(payments),
    ])

    const total = totalResult[0]?.value ?? 0
    const stats = statsResult[0]

    const totalRevenue = stats?.totalRevenue ? Number(stats.totalRevenue) : 0
    const totalCompleted = stats?.totalCompleted ?? 0
    const totalRejected = stats?.totalRejected ?? 0
    const decided = totalCompleted + totalRejected

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <header className="mt-6 mx-6">
                    <h1 className="font-heading text-2xl font-bold">Payments</h1>
                    <p className="text-muted-foreground">Manage payments accross apps.</p>
                </header>
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <PaymentsStatsCards
                        totalRevenue={totalRevenue}
                        pendingApproval={stats?.pendingCount ?? 0}
                        approvedToday={stats?.approvedToday ?? 0}
                        rejectedToday={stats?.rejectedToday ?? 0}
                        approvalRate={decided > 0 ? Math.round((totalCompleted / decided) * 100) : 0}
                        rejectionRate={decided > 0 ? Math.round((totalRejected / decided) * 100) : 0}
                    />
                    <PaymentsTable
                        data={rows as any}
                        page={page}
                        pageSize={pageSize}
                        total={total}
                        status={status ?? "all"}
                    />
                </div>
            </div>
        </div>
    )
}