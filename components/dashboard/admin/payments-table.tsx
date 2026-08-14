"use client"

import * as React from "react"
import Image from "next/image"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
    type VisibilityState,
} from "@tanstack/react-table"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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
    ChevronsLeftIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsRightIcon,
    RefreshCcw,
    EyeIcon,
    TrashIcon,
    CheckIcon,
    XIcon,
    ImageIcon,
    Loader2Icon,
} from "lucide-react"
import { PaymentViewDialog } from "./payment-view-dialog"
import { DeletePaymentDialog } from "./delete-payment-dialog"
import { BulkApproveDialog } from "./bulk-approve-dialog"
import { BulkDeclineDialog } from "./bulk-decline-dialog"
import { approvePayment, declinePayment } from "@/actions/payment-actions"

export type Payment = {
    id: string
    app_id: string | null
    payment_channel_id: string | null
    ref_no: string
    description: string
    amount: string
    currency: string
    proof_file_url: string
    proof_file_type: string
    status: string
    approved_by: string | null
    approved_at: string | null
    decline_reason: string | null
    customer_email: string | null
    customer_name: string | null
    payload: Record<string, unknown> | null
    created_at: string | null
    updated_at: string | null
    paid_at: string | null
    app: { id: string; name: string; slug: string } | null
    paymentChannel: { id: string; channel_name: string; label: string } | null
}

const TABS = [
    { value: "all", label: "All" },
    { value: "unpaid", label: "Unpaid" },
    { value: "pending", label: "Review Now" },
    { value: "declined", label: "Declined" },
    { value: "approved", label: "Approved" },
] as const

const HIDEABLE_COLUMN_IDS = [
    "merchant",
    "customer",
    "reference",
    "paid_at",
    "status",
] as const

export function formatCurrency(amount: string | number) {
    return `₱${Number(amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
}

export function formatDate(iso?: string | null) {
    if (!iso) return "—"
    return new Date(iso).toLocaleString("en-PH", {
        dateStyle: "medium",
        timeStyle: "short",
    })
}

export function StatusBadge({ status }: { status: string }) {
    const normalized = status.toLowerCase()

    const dotColor =
        normalized === "approved"
            ? "bg-green-500 dark:bg-green-400"
            : normalized === "declined" || normalized === "unpaid"
                ? "bg-red-500 dark:bg-red-400"
                : "bg-yellow-500 dark:bg-yellow-400"

    return (
        <Badge variant="outline" className="px-1.5 text-muted-foreground capitalize">
            <span className={`size-2 rounded-full ${dotColor}`} />
            {status}
        </Badge>
    )
}

function ProofPreviewDialog({
    payment,
    open,
    onOpenChange,
}: {
    payment: Payment | null
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const isImage = payment?.proof_file_type?.startsWith("image/")

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Proof of Payment</DialogTitle>
                </DialogHeader>

                {!payment ? null : isImage ? (
                    <div className="relative w-full overflow-hidden rounded-lg border bg-muted/30">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={payment.proof_file_url}
                            alt={`Proof of payment for ${payment.ref_no}`}
                            className="w-full h-auto max-h-[70vh] object-contain"
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border bg-muted/30 p-8 text-center">
                        <ImageIcon className="size-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            This file can&apos;t be previewed inline.
                        </p>
                        <Button asChild size="sm" variant="outline">
                            <a href={payment.proof_file_url} target="_blank" rel="noopener noreferrer">
                                Open file
                            </a>
                        </Button>
                    </div>
                )}

                {payment && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-heading">{payment.ref_no}</span>
                        <a
                            href={payment.proof_file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-4 hover:text-foreground"
                        >
                            Open original
                        </a>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

function getColumns({
    onView,
    onDelete,
    onPreviewProof,
    onApprove,
    pendingRowId,
}: {
    onView: (payment: Payment) => void
    onDelete: (payment: Payment) => void
    onPreviewProof: (payment: Payment) => void
    onApprove: (payment: Payment) => void
    pendingRowId: string | null
}): ColumnDef<Payment>[] {
    return [
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
            header: "Description",
            cell: ({ row }) => (
                <button
                    type="button"
                    onClick={() => onView(row.original)}
                    className="font-semibold text-left hover:underline underline-offset-4"
                >
                    {row.original.description ?? "—"}
                </button>
            ),
            enableHiding: false,
        },
        {
            id: "amount",
            header: "Amount",
            cell: ({ row }) => <p>{formatCurrency(row.original.amount)}</p>,
            enableHiding: false,
        },
        {
            id: "merchant",
            header: "Merchant",
            cell: ({ row }) => (
                <div className="w-32">
                    <Badge variant="outline" className="px-1.5 text-muted-foreground">
                        {row.original.app?.name ?? "—"}
                    </Badge>
                </div>
            ),
        },
        {
            id: "customer",
            header: "Customer",
            cell: ({ row }) => {
                const name = row.original.customer_name
                const email = row.original.customer_email
                if (!name) return <p className="text-muted-foreground">—</p>
                return (
                    <div className="flex flex-col">
                        <span>{name}</span>
                        {email && (
                            <span className="text-xs text-muted-foreground">{email}</span>
                        )}
                    </div>
                )
            },
        },
        {
            id: "reference",
            header: "Reference No.",
            cell: ({ row }) => <p className="font-heading">{row.original.ref_no}</p>,
        },
        {
            id: "paid_at",
            header: "Paid At",
            cell: ({ row }) =>
                row.original.paid_at ? (
                    <p>{formatDate(row.original.paid_at)}</p>
                ) : (
                    <span className="text-muted-foreground">Not paid yet.</span>
                ),
        },
        {
            id: "approved_at",
            header: "Approved At",
            cell: ({ row }) =>
                row.original.approved_at ? (
                    <p>{formatDate(row.original.approved_at)}</p>
                ) : (
                    <span className="text-muted-foreground">Not approved yet.</span>
                ),
        },
        {
            id: "status",
            header: "Status",
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const status = row.original.status.toLowerCase()
                const canReview = status === "pending"
                const hasProof = Boolean(row.original.proof_file_url)
                const isRowPending = pendingRowId === row.original.id

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                                size="icon"
                                disabled={isRowPending}
                            >
                                {isRowPending ? (
                                    <Loader2Icon className="animate-spin" />
                                ) : (
                                    <EllipsisVerticalIcon />
                                )}
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => onView(row.original)}>
                                <EyeIcon />
                                View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                disabled={!hasProof}
                                onClick={() => onPreviewProof(row.original)}
                            >
                                <ImageIcon />
                                Preview Proof
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                disabled={!canReview || isRowPending}
                                onClick={() => onApprove(row.original)}
                            >
                                <CheckIcon />
                                Approve
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => onDelete(row.original)}
                            >
                                <TrashIcon />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
}

export function PaymentsTable({
    data,
    page,
    pageSize,
    total,
    status,
}: {
    data: Payment[]
    page: number
    pageSize: number
    total: number
    status: string
}) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({})
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

    const [selectedPayment, setSelectedPayment] = React.useState<Payment | null>(null)
    const [viewDialogOpen, setViewDialogOpen] = React.useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [bulkApproveOpen, setBulkApproveOpen] = React.useState(false)
    const [bulkDeclineOpen, setBulkDeclineOpen] = React.useState(false)

    const [previewPayment, setPreviewPayment] = React.useState<Payment | null>(null)
    const [previewDialogOpen, setPreviewDialogOpen] = React.useState(false)

    // Tracks which single row is mid-approve/decline from the dropdown,
    // so we can disable that row's menu and show a spinner.
    const [pendingRowId, setPendingRowId] = React.useState<string | null>(null)

    React.useEffect(() => {
        setRowSelection({})
    }, [data])

    function updateParams(next: Record<string, string | number>) {
        const params = new URLSearchParams(searchParams.toString())
        Object.entries(next).forEach(([key, value]) => params.set(key, String(value)))
        router.push(`${pathname}?${params.toString()}`)
    }

    function handleView(payment: Payment) {
        setSelectedPayment(payment)
        setViewDialogOpen(true)
    }

    function handleDelete(payment: Payment) {
        setSelectedPayment(payment)
        setDeleteDialogOpen(true)
    }

    function handlePreviewProof(payment: Payment) {
        setPreviewPayment(payment)
        setPreviewDialogOpen(true)
    }

    async function handleApprove(payment: Payment) {
        setPendingRowId(payment.id)
        try {
            const result = await approvePayment(payment.id)
            if (result.success) {
                toast.success(`Payment ${payment.ref_no} approved.`)
                router.refresh()
            } else {
                toast.error(result.error)
            }
        } catch (error) {
            console.error("handleApprove error:", error)
            toast.error("Something went wrong while approving this payment.")
        } finally {
            setPendingRowId(null)
        }
    }

    const columns = React.useMemo(
        () =>
            getColumns({
                onView: handleView,
                onDelete: handleDelete,
                onPreviewProof: handlePreviewProof,
                onApprove: handleApprove,
                pendingRowId,
            }),
        [pendingRowId]
    )

    const table = useReactTable({
        data,
        columns,
        state: {
            columnVisibility,
            rowSelection,
        },
        getRowId: (row) => row.id,
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
    })

    const selectedRows = table.getSelectedRowModel().rows
    const selectedIds = selectedRows.map((row) => row.original.id)
    const selectedCount = selectedIds.length
    const hasUnpaidSelected = selectedRows.some(
        (row) => row.original.status.toLowerCase() === "unpaid"
    )

    function clearSelectionAndRefresh() {
        setRowSelection({})
        router.refresh()
    }

    const pageCount = Math.max(Math.ceil(total / pageSize), 1)
    const canPreviousPage = page > 1
    const canNextPage = page < pageCount

    return (
        <Tabs
            value={status}
            onValueChange={(value) => updateParams({ status: value, page: 1 })}
            className="w-full flex-col justify-start gap-6"
        >
            <div className="flex items-center justify-between px-4 lg:px-6">
                <Label htmlFor="view-selector" className="sr-only">
                    View
                </Label>
                <Select
                    value={status}
                    onValueChange={(value) => updateParams({ status: value, page: 1 })}
                >
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

                {selectedCount > 0 ? (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            {selectedCount} selected
                            {hasUnpaidSelected && (
                                <span className="ml-1 text-xs">
                                    (unpaid rows can&apos;t be approved/declined)
                                </span>
                            )}
                        </span>
                        <Button
                            size="sm"
                            onClick={() => setBulkApproveOpen(true)}
                            disabled={hasUnpaidSelected}
                        >
                            <CheckIcon data-icon="inline-start" />
                            Approve
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setBulkDeclineOpen(true)}
                            disabled={hasUnpaidSelected}
                        >
                            <XIcon data-icon="inline-start" />
                            Decline
                        </Button>
                    </div>
                ) : (
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
                        <Button variant="outline" size="sm" onClick={() => router.refresh()}>
                            <RefreshCcw />
                            <span className="hidden lg:inline">Refresh</span>
                        </Button>
                    </div>
                )}
            </div>

            <TabsContent value={status} className="m-0">
                <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
                    <div className="overflow-hidden rounded-lg border">
                        <Table>
                            <TableHeader className="sticky top-0 z-10 bg-muted">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id} colSpan={header.colSpan}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex items-center justify-between px-4">
                        <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
                            {Object.keys(rowSelection).length} of {data.length} row(s) selected.
                        </div>
                        <div className="flex w-full items-center gap-8 lg:w-fit">
                            <div className="hidden items-center gap-2 lg:flex">
                                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                                    Rows per page
                                </Label>
                                <Select
                                    value={`${pageSize}`}
                                    onValueChange={(value) => updateParams({ pageSize: value, page: 1 })}
                                >
                                    <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                                        <SelectValue placeholder={pageSize} />
                                    </SelectTrigger>
                                    <SelectContent side="top">
                                        <SelectGroup>
                                            {[10, 20, 30, 40, 50].map((size) => (
                                                <SelectItem key={size} value={`${size}`}>
                                                    {size}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex w-fit items-center justify-center text-sm font-medium">
                                Page {page} of {pageCount}
                            </div>
                            <div className="ml-auto flex items-center gap-2 lg:ml-0">
                                <Button
                                    variant="outline"
                                    className="hidden h-8 w-8 p-0 lg:flex"
                                    onClick={() => updateParams({ page: 1 })}
                                    disabled={!canPreviousPage}
                                >
                                    <span className="sr-only">Go to first page</span>
                                    <ChevronsLeftIcon />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="size-8"
                                    size="icon"
                                    onClick={() => updateParams({ page: page - 1 })}
                                    disabled={!canPreviousPage}
                                >
                                    <span className="sr-only">Go to previous page</span>
                                    <ChevronLeftIcon />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="size-8"
                                    size="icon"
                                    onClick={() => updateParams({ page: page + 1 })}
                                    disabled={!canNextPage}
                                >
                                    <span className="sr-only">Go to next page</span>
                                    <ChevronRightIcon />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="hidden size-8 lg:flex"
                                    size="icon"
                                    onClick={() => updateParams({ page: pageCount })}
                                    disabled={!canNextPage}
                                >
                                    <span className="sr-only">Go to last page</span>
                                    <ChevronsRightIcon />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </TabsContent>

            <PaymentViewDialog
                payment={selectedPayment}
                open={viewDialogOpen}
                onOpenChange={setViewDialogOpen}
            />
            <DeletePaymentDialog
                payment={selectedPayment}
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            />
            <ProofPreviewDialog
                payment={previewPayment}
                open={previewDialogOpen}
                onOpenChange={setPreviewDialogOpen}
            />
            <BulkApproveDialog
                open={bulkApproveOpen}
                onOpenChange={setBulkApproveOpen}
                paymentIds={selectedIds}
                onSuccess={clearSelectionAndRefresh}
            />
            <BulkDeclineDialog
                open={bulkDeclineOpen}
                onOpenChange={setBulkDeclineOpen}
                paymentIds={selectedIds}
                onSuccess={clearSelectionAndRefresh}
            />
        </Tabs>
    )
}