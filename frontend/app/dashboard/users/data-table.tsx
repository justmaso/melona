"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import { useState } from "react"
import type {
    ColumnFiltersState,
    SortingState,
    VisibilityState,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreateUserDialog } from "@/components/dialogs/create-user-dialog"

export function DataTable<TData, TValue>({
    columns,
    data,
    totalCount,
    page,
    limit,
    onPageChange,
    onUserCreated
}: {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    totalCount: number
    page: number
    limit: number
    onPageChange: (page: number) => void
    onUserCreated: () => void
}) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    
    const { user } = useAuth()
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
        
        // getPaginationRowModel: getPaginationRowModel(),
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
        <div className="w-full">
            <div className="flex align-items justify-between gap-2">
                <Input
                    placeholder="Filter by name"
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                />
                <CreateUserDialog onUserCreated={onUserCreated} />
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
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => {

                                const rowUser = row.original as any
                                const route = user && rowUser.id === user.id
                                    ? "/dashboard/users/me"
                                    : `/dashboard/users/${rowUser.id}`
                                
                                return (
                                    <TableRow
                                        key={row.id}
                                        className="cursor-pointer hover:bg-blue-50"
                                        onClick={() => router.push(route)}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                )
                            })
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="text-center h-24"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="text-muted-foreground flex-1 text-sm">
                        Showing {(page - 1) * limit + 1} to{" "}
                        {Math.min(page * limit, totalCount)} of {totalCount} users
                    {/* {table.getFilteredSelectedRowModel().rows.length} of{" "} */}
                    {/* {table.getFilteredRowModel().rows.length} row(s) */}
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        // onClick={() => table.previousPage()}
                        onClick={() => onPageChange(page - 1)}
                        // disabled={!table.getCanPreviousPage()}
                        disabled={!canPreviousPage}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        // onClick={() => table.nextPage()}
                        onClick={() => onPageChange(page + 1)}
                        // disabled={!table.getCanNextPage()}
                        disabled={!canNextPage}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}
