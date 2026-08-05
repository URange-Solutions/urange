import { Button } from "@/components/ui/button";
import { Boxes, Plus } from "lucide-react";

export function EmptyState({ label, onCreate }: { label: string; onCreate: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
            <Boxes className="size-8 text-muted-foreground" aria-hidden="true" />
            <div>
                <p className="font-medium">No {label} found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search or create a new one.</p>
            </div>
            <Button variant="outline" onClick={onCreate} className="gap-2">
                <Plus className="size-4" aria-hidden="true" />
                New {label.slice(0, -1)}
            </Button>
        </div>
    )
}