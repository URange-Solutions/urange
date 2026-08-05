import data from "@/data/tickets-dummy.json"
import { TicketsTable } from "@/components/dashboard/admin/tickets-table"
import { TicketsStatsCards } from "@/components/dashboard/admin/ticket-cards"

export default function Page() {
    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <header className="mt-6 mx-6">
                    <h1 className="font-heading text-2xl font-bold">Tickets</h1>
                    <p className="text-muted-foreground">Manage support tickets accross apps.</p>
                </header>
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <TicketsStatsCards />
                    <TicketsTable data={data} />
                </div>
            </div>
        </div>
    )
}