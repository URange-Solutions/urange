'use client';

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Handshake, Sparkles, Store } from "lucide-react";
import Link from "next/link";
import React from "react";
import { usePathname } from 'next/navigation'

export function ProductsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const current = (pathname.split('/')[4]);

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <header className="mx-6 mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="font-heading text-2xl font-bold">Products</h1>
                        <p className="text-muted-foreground">Manage the homepage showcase, App Store listings, and software for sale.</p>
                    </div>
                </header>

                <div className="mx-6 flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <Tabs defaultValue={current ? current : "showcase"} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 sm:w-fit">
                            <TabsTrigger value="showcase" className="gap-1.5" asChild>
                                <Link href="/admin/cms/products">
                                    <Sparkles className="size-4" aria-hidden="true" />
                                    Showcase
                                </Link>
                            </TabsTrigger>
                            <TabsTrigger value="software" className="gap-1.5" asChild>
                                <Link href="/admin/cms/products/software">
                                    <Handshake className="size-4" aria-hidden="true" />
                                    Software
                                </Link>
                            </TabsTrigger>
                            <TabsTrigger value="appstore" className="gap-1.5" asChild>
                                <Link href="/admin/cms/products/appstore">
                                    <Store className="size-4" aria-hidden="true" />
                                    App Store
                                </Link>
                            </TabsTrigger>
                        </TabsList>
                        {children}
                    </Tabs>
                </div>
            </div >
        </div >
    )
}