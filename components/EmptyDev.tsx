import { ArrowUpRightIcon, HardHat } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"

export function EmptyDev() {
    return (
        <div className="h-screen flex items-center justify-center bg-background">
            <Empty className="relative overflow-hidden">

                <EmptyHeader className="relative">
                    <EmptyMedia
                        variant="icon"
                        className="transition-transform duration-300 hover:-rotate-6"
                    >
                        <HardHat />
                    </EmptyMedia>
                    <EmptyTitle>This page is under construction</EmptyTitle>
                    <EmptyDescription>
                        We&apos;re currently building this now. Check back soon —
                        it&apos;ll be worth the wait.
                    </EmptyDescription>
                </EmptyHeader>

                <EmptyContent className="relative">
                    <Button
                        variant="link"
                        className="text-muted-foreground"
                        size="sm">
                        <a href="#" className="flex flex-row items-center gap-1">
                            <span>See what&apos;s next</span><ArrowUpRightIcon />
                        </a>
                    </Button>
                </EmptyContent>
            </Empty>
        </div>
    )
}