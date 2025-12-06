"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { useState } from "react"
import type {
    ColumnFiltersState,
    SortingState,
    VisibilityState,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CreateTransactionDropdownMenu } from "@/components/transactions/transaction-dropdown-menu"


export function DataTable<TData, TValue>({
    columns,
    data,
    totalCount,
    page,
    limit,
    onPageChange,
}: {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    totalCount: number
    page: number
    limit: number
    onPageChange: (page: number) => void
}) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})

    const router = useRouter()

    const pageCount = Math.ceil(totalCount / limit)
    const canPreviousPage = page > 1
    const canNextPage = page < pageCount

    const table = useReactTable({
        data,
        columns,
        pageCount,
        manualPagination: true,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <div className="w-full space-y-4">
            <div className="flex align-items justify-between gap-2">
                <Input
                    placeholder="Filter by type..."
                    value={(table.getColumn("type")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("type")?.setFilterValue(event.target.value)
                    }
                />
                <CreateTransactionDropdownMenu viewingFromMyTransactions={true} />
            </div>

            <div className="rounded-md border w-full overflow-auto">
                <Table className="w-full table-auto">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => {
                                const original = row.original as any
                                const route = original.id ? `/dashboard/my-transactions/${original.id}` : ""

                                return (
                                    <TableRow
                                        key={row.id}
                                        className="cursor-pointer hover:bg-blue-50"
                                        onClick={() => route && router.push(route)}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                )
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="text-center h-24">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between py-4">
                <div className="text-muted-foreground text-sm">
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of{" "}
                    {totalCount}
                </div>

                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!canPreviousPage}
                        onClick={() => onPageChange(page - 1)}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!canNextPage}
                        onClick={() => onPageChange(page + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}
