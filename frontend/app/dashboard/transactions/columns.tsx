"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Transaction } from "@/models"
import { Badge } from "@/components/ui/badge"
import { NumericFormat } from "react-number-format"

export const columns: ColumnDef<Transaction>[] = [
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("type") as string
            return type.charAt(0).toUpperCase() + type.slice(1)
        },
    },
    {
        accessorKey: "utorid",
        header: "UTORid",
        cell: ({ row }) => row.getValue("utorid"),
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
            const amount = row.getValue("amount") as number
            return (
                <NumericFormat
                    value={amount}
                    thousandSeparator=","
                    displayType="text"
                />
            )
        },
    },
    {
        accessorKey: "promotionIds",
        header: "Promotions",
        cell: ({ row }) => {
            const ids = row.getValue("promotionIds") as number[] | undefined
            return ids && ids.length ? ids.join(", ") : "-"
        },
    },
    {
        accessorKey: "remark",
        header: "Remark",
        cell: ({ row }) => row.getValue("remark") || "-",
    },
    {
        accessorKey: "suspicious",
        header: "Status",
        cell: ({ row }) => {
            const suspicious = row.getValue("suspicious") as boolean
            console.log("Suspicious value:", suspicious, typeof suspicious)
            return (
                <Badge variant={suspicious ? "destructive" : "secondary"}>
                    {suspicious ? "Suspicious" : "Not suspicious"}
                </Badge>
            )
        },
    },
    {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => {
            const t = new Date(row.getValue("createdAt"))
            return t.toLocaleString()
        },
    },
]
