"use client"

import * as React from "react"
import {
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type Row,
    type VisibilityState,
} from "@tanstack/react-table"
import { toast } from "sonner"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    EllipsisVerticalIcon,
    Columns3Icon,
    ChevronDownIcon,
    ChevronsLeftIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsRightIcon,
    RefreshCcw,
    SearchIcon,
    XIcon,
} from "lucide-react"
import { CreateTicketDialog } from "./create-ticket-dialog"
import { TicketDetailSheet } from "./ticket-detail-sheet"

export const schema = z.object({
    id: z.string(),
    ticket_number: z.string(),
    subject: z.string(),
    priority: z.string(),
    status: z.string(),
    assignee: z.string().nullable().optional(),
    created_at: z.string(),
    updated_at: z.string().nullable().optional(),
    metadata: z.object({
        description: z.string().optional(),
        category: z.string().optional(),
        customer: z
            .object({
                name: z.string().optional(),
                email: z.string().optional(),
                phone: z.string().optional(),
            })
            .optional(),
        notes: z
            .array(
                z.object({
                    author: z.string(),
                    message: z.string(),
                    created_at: z.string(),
                })
            )
            .optional(),
    }),
})

export type Ticket = z.infer<typeof schema>

const TABS = [
    { value: "all", label: "All" },
    { value: "open", label: "Open" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
] as const

const PRIORITY_FILTERS = ["all", "low", "medium", "high", "urgent"] as const

const HIDEABLE_COLUMN_IDS = [
    "customer",
    "assignee",
    "priority",
    "updated_at",
    "status",
] as const

function formatDate(iso?: string | null) {
    if (!iso) return "—"
    return new Date(iso).toLocaleString("en-PH", {
        dateStyle: "medium",
        timeStyle: "short",
    })
}

function StatusBadge({ status }: { status: string }) {
    const normalized = status.toLowerCase()

    const dotColor =
        normalized === "resolved" || normalized === "closed"
            ? "bg-green-500 dark:bg-green-400"
            : normalized === "in_progress"
                ? "bg-blue-500 dark:bg-blue-400"
                : "bg-yellow-500 dark:bg-yellow-400"

    return (
        <Badge variant="outline" className="px-1.5 text-muted-foreground capitalize">
            <span className={`size-2 rounded-full ${dotColor}`} />
            {status.replace("_", " ")}
        </Badge>
    )
}

function PriorityBadge({ priority }: { priority: string }) {
    const normalized = priority.toLowerCase()

    const variantClass =
        normalized === "urgent"
            ? "border-red-500/40 text-red-600 dark:text-red-400"
            : normalized === "high"
                ? "border-orange-500/40 text-orange-600 dark:text-orange-400"
                : normalized === "medium"
                    ? "border-yellow-500/40 text-yellow-600 dark:text-yellow-400"
                    : "border-muted-foreground/30 text-muted-foreground"

    return (
        <Badge variant="outline" className={`px-1.5 capitalize ${variantClass}`}>
            {priority}
        </Badge>
    )
}

function buildColumns(): ColumnDef<Ticket>[] {
    return [
        {
            id: "select",
            header: ({ table }) => (
                <div
                    className="flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() && "indeterminate")
                        }
                        onCheckedChange={(value) =>
                            table.toggleAllPageRowsSelected(!!value)
                        }
                        aria-label="Select all"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div
                    className="flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "ticket_number",
            header: "Ticket No.",
            cell: ({ row }) => (
                <p className="font-heading text-muted-foreground">
                    {row.original.ticket_number}
                </p>
            ),
        },
        {
            id: "subject",
            accessorFn: (row) => row.subject,
            header: "Subject",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-semibold">{row.original.subject}</span>
                    {row.original.metadata?.category && (
                        <span className="text-xs text-muted-foreground">
                            {row.original.metadata.category}
                        </span>
                    )}
                </div>
            ),
            enableHiding: false,
        },
        {
            accessorKey: "priority",
            header: "Priority",
            filterFn: "equalsString",
            cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
        },
        {
            id: "customer",
            accessorFn: (row) => row.metadata?.customer?.name ?? "",
            header: "Customer",
            cell: ({ row }) => {
                const customer = row.original.metadata?.customer
                if (!customer?.name) return <p className="text-muted-foreground">—</p>
                return (
                    <div className="flex flex-col">
                        <span>{customer.name}</span>
                        {customer.email && (
                            <span className="text-xs text-muted-foreground">
                                {customer.email}
                            </span>
                        )}
                    </div>
                )
            },
        },
        {
            id: "assignee",
            accessorFn: (row) => row.assignee ?? "Unassigned",
            header: "Assignee",
            filterFn: "equalsString",
            cell: ({ row }) =>
                row.original.assignee ? (
                    <div className="w-32">
                        <Badge variant="outline" className="px-1.5 text-muted-foreground">
                            {row.original.assignee}
                        </Badge>
                    </div>
                ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                ),
        },
        {
            accessorKey: "updated_at",
            header: "Updated",
            cell: ({ row }) => <p>{formatDate(row.original.updated_at)}</p>,
        },
        {
            accessorKey: "created_at",
            header: "Created",
            cell: ({ row }) => <p>{formatDate(row.original.created_at)}</p>,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                                size="icon"
                            >
                                <EllipsisVerticalIcon />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                                onClick={() =>
                                    navigator.clipboard.writeText(row.original.ticket_number)
                                }
                            >
                                Copy ticket no.
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => toast("Assign flow not implemented yet")}
                            >
                                Assign to me
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => toast("Close ticket flow not implemented yet")}
                            >
                                Close ticket
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ]
}

function TicketRow({
    row,
    onRowClick,
}: {
    row: Row<Ticket>
    onRowClick: (ticket: Ticket) => void
}) {
    return (
        <TableRow
            data-state={row.getIsSelected() && "selected"}
            onClick={() => onRowClick(row.original)}
            className="cursor-pointer"
        >
            {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
            ))}
        </TableRow>
    )
}

function TicketsDataTable({
    data,
    columns,
    rowSelection,
    setRowSelection,
    columnVisibility,
    setColumnVisibility,
    columnFilters,
    setColumnFilters,
    globalFilter,
    pagination,
    setPagination,
    onRowClick,
}: {
    data: Ticket[]
    columns: ColumnDef<Ticket>[]
    rowSelection: Record<string, boolean>
    setRowSelection: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
    columnVisibility: VisibilityState
    setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>
    columnFilters: ColumnFiltersState
    setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>
    globalFilter: string
    pagination: { pageIndex: number; pageSize: number }
    setPagination: React.Dispatch<
        React.SetStateAction<{ pageIndex: number; pageSize: number }>
    >
    onRowClick: (ticket: Ticket) => void
}) {
    const table = useReactTable({
        data,
        columns,
        state: {
            columnVisibility,
            rowSelection,
            columnFilters,
            globalFilter,
            pagination,
        },
        getRowId: (row) => row.id,
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        globalFilterFn: (row, _columnId, filterValue: string) => {
            const search = filterValue.trim().toLowerCase()
            if (!search) return true
            const t = row.original
            return (
                t.subject.toLowerCase().includes(search) ||
                t.ticket_number.toLowerCase().includes(search) ||
                (t.metadata?.customer?.name?.toLowerCase().includes(search) ?? false) ||
                (t.metadata?.customer?.email?.toLowerCase().includes(search) ?? false)
            )
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    })

    return (
        <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
            <div className="overflow-hidden rounded-lg border">
                <Table>
                    <TableHeader className="sticky top-0 z-10 bg-muted">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} colSpan={header.colSpan}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TicketRow key={row.id} row={row} onRowClick={onRowClick} />
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between px-4">
                <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="flex w-full items-center gap-8 lg:w-fit">
                    <div className="hidden items-center gap-2 lg:flex">
                        <Label htmlFor="rows-per-page" className="text-sm font-medium">
                            Rows per page
                        </Label>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value))
                            }}
                        >
                            <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                                <SelectValue
                                    placeholder={table.getState().pagination.pageSize}
                                />
                            </SelectTrigger>
                            <SelectContent side="top">
                                <SelectGroup>
                                    {[10, 20, 30, 40, 50].map((pageSize) => (
                                        <SelectItem key={pageSize} value={`${pageSize}`}>
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex w-fit items-center justify-center text-sm font-medium">
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {Math.max(table.getPageCount(), 1)}
                    </div>
                    <div className="ml-auto flex items-center gap-2 lg:ml-0">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to first page</span>
                            <ChevronsLeftIcon />
                        </Button>
                        <Button
                            variant="outline"
                            className="size-8"
                            size="icon"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeftIcon />
                        </Button>
                        <Button
                            variant="outline"
                            className="size-8"
                            size="icon"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to next page</span>
                            <ChevronRightIcon />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden size-8 lg:flex"
                            size="icon"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to last page</span>
                            <ChevronsRightIcon />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function TicketsTable({
    data: initialData,
}: {
    data: Ticket[]
}) {
    const columns = React.useMemo(() => buildColumns(), [])

    const [data, setData] = React.useState(() => initialData)
    const [activeTab, setActiveTab] = React.useState<string>("all")
    const [rowSelection, setRowSelection] = React.useState({})
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [globalFilter, setGlobalFilter] = React.useState("")
    const [priorityFilter, setPriorityFilter] = React.useState<string>("all")
    const [assigneeFilter, setAssigneeFilter] = React.useState<string>("all")
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    })
    const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(
        null
    )
    const [sheetOpen, setSheetOpen] = React.useState(false)

    const assigneeOptions = React.useMemo(() => {
        const set = new Set<string>()
        data.forEach((t) => set.add(t.assignee || "Unassigned"))
        return Array.from(set).sort()
    }, [data])

    function setFilter(id: string, value: string) {
        setColumnFilters((prev) => {
            const rest = prev.filter((f) => f.id !== id)
            if (value === "all") return rest
            return [...rest, { id, value }]
        })
        setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    }

    function handleTabChange(value: string) {
        setActiveTab(value)
        setFilter("status", value)
    }

    function handlePriorityChange(value: string) {
        setPriorityFilter(value)
        setFilter("priority", value)
    }

    function handleAssigneeChange(value: string) {
        setAssigneeFilter(value)
        setFilter("assignee", value)
    }

    function handleRowClick(ticket: Ticket) {
        setSelectedTicket(ticket)
        setSheetOpen(true)
    }

    function handleCreateTicket(ticket: Ticket) {
        setData((prev) => [ticket, ...prev])
        setActiveTab("all")
        setColumnFilters((prev) => prev.filter((f) => f.id !== "status"))
    }

    function handleUpdateTicket(updated: Ticket) {
        setData((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
        setSelectedTicket(updated)
    }

    const hasFilters =
        globalFilter.trim() !== "" ||
        priorityFilter !== "all" ||
        assigneeFilter !== "all"

    function clearFilters() {
        setGlobalFilter("")
        setPriorityFilter("all")
        setAssigneeFilter("all")
        setColumnFilters((prev) =>
            prev.filter((f) => f.id !== "priority" && f.id !== "assignee")
        )
    }

    return (
        <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full flex-col justify-start gap-6"
        >
            <div className="flex flex-col gap-3 px-4 lg:px-6">
                <div className="flex items-center justify-between">
                    <Label htmlFor="view-selector" className="sr-only">
                        View
                    </Label>
                    <Select value={activeTab} onValueChange={handleTabChange}>
                        <SelectTrigger
                            className="flex w-fit @4xl/main:hidden"
                            size="sm"
                            id="view-selector"
                        >
                            <SelectValue placeholder="Select a view" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {TABS.map((tab) => (
                                    <SelectItem key={tab.value} value={tab.value}>
                                        {tab.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <TabsList className="hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1 @4xl/main:flex">
                        {TABS.map((tab) => (
                            <TabsTrigger key={tab.value} value={tab.value}>
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Columns3Icon data-icon="inline-start" />
                                    Columns
                                    <ChevronDownIcon data-icon="inline-end" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                {HIDEABLE_COLUMN_IDS.map((id) => (
                                    <DropdownMenuCheckboxItem
                                        key={id}
                                        className="capitalize"
                                        checked={columnVisibility[id] !== false}
                                        onCheckedChange={(value) =>
                                            setColumnVisibility((prev) => ({
                                                ...prev,
                                                [id]: !!value,
                                            }))
                                        }
                                    >
                                        {id}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="outline" size="sm">
                            <RefreshCcw />
                            <span className="hidden lg:inline">Refresh</span>
                        </Button>
                        <CreateTicketDialog
                            onCreate={handleCreateTicket}
                            ticketCount={data.length}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-full max-w-xs">
                        <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Search subject, ticket no., customer…"
                            className="pl-8"
                        />
                    </div>
                    <Select value={priorityFilter} onValueChange={handlePriorityChange}>
                        <SelectTrigger size="sm" className="w-36">
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                            {PRIORITY_FILTERS.map((p) => (
                                <SelectItem key={p} value={p} className="capitalize">
                                    {p === "all" ? "All priorities" : p}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={assigneeFilter} onValueChange={handleAssigneeChange}>
                        <SelectTrigger size="sm" className="w-40">
                            <SelectValue placeholder="Assignee" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All assignees</SelectItem>
                            {assigneeOptions.map((a) => (
                                <SelectItem key={a} value={a}>
                                    {a}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {hasFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="text-muted-foreground"
                        >
                            <XIcon data-icon="inline-start" />
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            {TABS.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="m-0">
                    <TicketsDataTable
                        data={data}
                        columns={columns}
                        rowSelection={rowSelection}
                        setRowSelection={setRowSelection}
                        columnVisibility={columnVisibility}
                        setColumnVisibility={setColumnVisibility}
                        columnFilters={columnFilters}
                        setColumnFilters={setColumnFilters}
                        globalFilter={globalFilter}
                        pagination={pagination}
                        setPagination={setPagination}
                        onRowClick={handleRowClick}
                    />
                </TabsContent>
            ))}

            <TicketDetailSheet
                ticket={selectedTicket}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                onUpdate={handleUpdateTicket}
            />
        </Tabs>
    )
}