import { AppSidebar } from "@/components/dashboard/admin/app-sidebar"
import { SiteHeader } from "@/components/dashboard/admin/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getAdminSession } from "@/lib/auth";
import { Metadata } from "next";
import { ReactNode } from "react"
import { Toaster } from "sonner"

export const metadata: Metadata = {
    title: "URange Solutions | Admin Panel",
    description: "Manage URange Solutions informations.",
    icons: {
        icon: '/icon.png'
    }
};

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
    const session = await getAdminSession();

    if (!session?.admins) return null;

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
                    <Toaster />
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}