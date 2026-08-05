import data from "@/data/dummy.json"
import { PaymentsTable } from "@/components/dashboard/admin/payments-table"
import { PaymentsStatsCards } from "@/components/dashboard/admin/payments-cards"

export default function Page() {
    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <header className="mt-6 mx-6">
                    <h1 className="font-heading text-2xl font-bold">Payments</h1>
                    <p className="text-muted-foreground">Manage payments accross apps.</p>
                </header>
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <PaymentsStatsCards />
                    <PaymentsTable data={data} />
                </div>
            </div>
        </div>
    )
}
