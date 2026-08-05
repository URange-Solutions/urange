"use client"

import * as React from "react"

import { NavServices } from "@/components/dashboard/admin/nav-services"
import { NavMain } from "@/components/dashboard/admin/nav-main"
import { NavSecondary } from "@/components/dashboard/admin/nav-secondary"
import { NavUser } from "@/components/dashboard/admin/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutIcon, Settings2Icon, SearchIcon, Lock, Book, Layers, CreditCard, Ticket, FolderKanban, HardDrive, User2, Users, Inbox } from "lucide-react"
import logo from "@/assets/logo.png"
import Image from "next/image"
import { NavManage } from "./nav-manage"
import { NavSupport } from "./nav-support"
import { AdminAuthSession } from "@/lib/auth"
import { AdminSchema } from "@/database/schema"
const data = {
  user: {
    name: "libyzxy0",
    email: "me@libyzxy0.me",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Overview",
      url: "/admin",
      icon: (
        <LayoutIcon
        />
      ),
    },
    {
      title: "Inbox",
      url: "/admin/inbox",
      icon: (
        <Inbox
        />
      ),
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/admin/settings",
      icon: (
        <Settings2Icon
        />
      ),
    },
    {
      title: "Search",
      url: "#",
      icon: (
        <SearchIcon
        />
      ),
    },
  ],
  services: [
    {
      name: "Apps",
      url: "/admin/apps",
      icon: (
        <Layers
        />
      ),
    },
    {
      name: "Payments",
      url: "/admin/payments",
      icon: (
        <CreditCard
        />
      ),
    },
  ],
  support: [
    {
      name: "Tickets",
      url: "/admin/tickets",
      icon: (
        <Ticket
        />
      ),
    },
  ],
  manage: [
    {
      name: "Blogs",
      url: "/admin/cms/blogs",
      icon: (
        <Book
        />
      ),
    },
    {
      name: "Products",
      url: "/admin/cms/products",
      icon: (
        <FolderKanban
        />
      ),
    },
    {
      name: "Media Library",
      url: "/admin/cms/media",
      icon: (
        <HardDrive
        />
      ),
    },
  ],
}

type AppSidebarProps = {
  admin: AdminSchema;
} & React.ComponentProps<typeof Sidebar>;

export function AppSidebar({ admin, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#" className="flex flex-row items-center">
                <Image src={logo} alt="URange Systems Logo" className="h-10 w-10" />
                <span className="text-brand font-bold text-lg font-heading">URange Solutions</span>
              </a>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavManage items={data.manage} />
        <NavServices items={data.services} />
        <NavSupport items={data.support} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={admin} />
      </SidebarFooter>
    </Sidebar>
  )
}
