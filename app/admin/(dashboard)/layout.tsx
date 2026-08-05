import { AppSidebar } from "@/components/dashboard/admin/app-sidebar"
import { SiteHeader } from "@/components/dashboard/admin/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getAdminSession } from "@/lib/auth";
import { ReactNode } from "react"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    const session = await getAdminSession();

    if(!session?.admins) return null;

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" admin={session?.admins} />
            <SidebarInset>
                <SiteHeader />
                <main>
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}