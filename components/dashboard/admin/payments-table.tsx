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
    PlusIcon,
    ChevronsLeftIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsRightIcon,
    RefreshCcw,
} from "lucide-react"

export const schema = z.object({
    id: z.string(),
    merchant_id: z.string(),
    merchant: z.string(),
    transaction_id: z.string(),
    amount: z.number(),
    status: z.string(),
    reference: z.string(),
    paid_at: z.string().nullable().optional(),
    created_at: z.string(),
    metadata: z.object({
        description: z.string().optional(),
        customer: z
            .object({
                name: z.string().optional(),
                email: z.string().optional(),
                phone: z.string().optional(),
            })
            .optional(),
    }),
})

export type Payment = z.infer<typeof schema>

const TABS = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "rejected", label: "Rejected" },
    { value: "completed", label: "Completed" },
] as const

const HIDEABLE_COLUMN_IDS = [
    "merchant",
    "customer",
    "reference",
    "paid_at",
    "status",
] as const

function formatCurrency(amount: number) {
    return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
}

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
        normalized === "completed"
            ? "bg-green-500 dark:bg-green-400"
            : normalized === "rejected" || normalized === "failed"
                ? "bg-red-500 dark:bg-red-400"
                : "bg-yellow-500 dark:bg-yellow-400"

    return (
        <Badge variant="outline" className="px-1.5 text-muted-foreground capitalize">
            <span className={`size-2 rounded-full ${dotColor}`} />
            {status}
        </Badge>
    )
}

const columns: ColumnDef<Payment>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
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
        id: "description",
        accessorFn: (row) => row.metadata?.description ?? "",
        header: "Description",
        cell: ({ row }) => <p className="font-semibold">{row.original.metadata?.description ?? "—"}</p>,
        enableHiding: false,
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => <p>{formatCurrency(row.original.amount)}</p>,
        enableHiding: false,
    },
    {
        accessorKey: "merchant",
        header: "Merchant",
        cell: ({ row }) => (
            <div className="w-32">
                <Badge variant="outline" className="px-1.5 text-muted-foreground">
                    {row.original.merchant}
                </Badge>
            </div>
        ),
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
        accessorKey: "reference",
        header: "Reference No.",
        cell: ({ row }) => <p className="font-heading">{row.original.reference}</p>,
    },
    {
        accessorKey: "paid_at",
        header: "Paid At",
        cell: ({ row }) => row.original.paid_at ? <p>{formatDate(row.original.paid_at)}</p> : <span className="text-muted-foreground">Not paid yet.</span>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
        id: "actions",
        cell: ({ row }) => (
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
                            navigator.clipboard.writeText(row.original.transaction_id)
                        }
                    >
                        Copy transaction ID
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() =>
                            navigator.clipboard.writeText(row.original.reference)
                        }
                    >
                        Copy reference no.
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={() => toast("Refund flow not implemented yet")}
                    >
                        Refund
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
]

function PaymentRow({ row }: { row: Row<Payment> }) {
    return (
        <TableRow data-state={row.getIsSelected() && "selected"}>
            {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
            ))}
        </TableRow>
    )
}

function PaymentsDataTable({
    data,
    rowSelection,
    setRowSelection,
    columnVisibility,
    setColumnVisibility,
    columnFilters,
    setColumnFilters,
    pagination,
    setPagination,
}: {
    data: Payment[]
    rowSelection: Record<string, boolean>
    setRowSelection: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
    columnVisibility: VisibilityState
    setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>
    columnFilters: ColumnFiltersState
    setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>
    pagination: { pageIndex: number; pageSize: number }
    setPagination: React.Dispatch<
        React.SetStateAction<{ pageIndex: number; pageSize: number }>
    >
}) {
    const table = useReactTable({
        data,
        columns,
        state: {
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
        },
        getRowId: (row) => row.id,
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
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
                                <PaymentRow key={row.id} row={row} />
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

export function PaymentsTable({
    data: initialData,
}: {
    data: Payment[]
}) {
    const [data, setData] = React.useState(() => initialData)
    const [activeTab, setActiveTab] = React.useState<string>("all")
    const [rowSelection, setRowSelection] = React.useState({})
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    })

    function handleTabChange(value: string) {
        setActiveTab(value)
        setPagination((prev) => ({ ...prev, pageIndex: 0 }))
        setColumnFilters(
            value === "all" ? [] : [{ id: "status", value }]
        )
    }

    return (
        <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full flex-col justify-start gap-6"
        >
            <div className="flex items-center justify-between px-4 lg:px-6">
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
                </div>
            </div>

            {TABS.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="m-0">
                    <PaymentsDataTable
                        data={data}
                        rowSelection={rowSelection}
                        setRowSelection={setRowSelection}
                        columnVisibility={columnVisibility}
                        setColumnVisibility={setColumnVisibility}
                        columnFilters={columnFilters}
                        setColumnFilters={setColumnFilters}
                        pagination={pagination}
                        setPagination={setPagination}
                    />
                </TabsContent>
            ))}
        </Tabs>
    )
}