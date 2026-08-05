import { AppsGrid } from "@/components/dashboard/admin/apps-grid"
import data from "@/data/apps-dummy.json"

export default function Apps() {
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
                    <AppsGrid data={data} />
                </div>
            </div>
        </div>
    )
}