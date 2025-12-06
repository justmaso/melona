"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Promotion } from "@/models"

export const columns: ColumnDef<Promotion>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("name")}</div>
        ),
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("type") as string
            return type === "onetime"
                ? "One-time"
                : "Automatic"
        }
    },
    {
        accessorKey: "rate",
        header: "Rate",
        cell: ({ row }) => {
            const rate = row.getValue("rate") as number
            return rate > 0 ? `${rate}%` : "-"
        }
    },
    {
        accessorKey: "points",
        header: "Points",
        cell: ({ row }) => {
            const points = row.getValue("points") as number
            return points > 0 ? points : "-"
        }
    },
    {
        accessorKey: "minSpending",
        header: "Min Spending",
        cell: ({ row }) => {
            const m = row.getValue("minSpending") as number
            return m > 0 ? `$${m.toFixed(2)}` : "-"
        }
    },
    {
        accessorKey: "startTime",
        header: "Starts",
        cell: ({ row }) => {
            const t = new Date(row.getValue("startTime"))
            return t.toDateString()
        }
    },
    {
        accessorKey: "endTime",
        header: "Ends",
        cell: ({ row }) => {
            const t = new Date(row.getValue("endTime"))
            return t.toDateString()
        }
    },
]
