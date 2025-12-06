"use client"

import { DataTable } from "./data-table"
import { columns } from "./columns"
import { TransactionService } from "@/lib/services/transaction"
import { Transaction } from "@/models"
import { useEffect, useState } from "react"

export default function TransactionsPageClient() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [loading, setLoading] = useState(false)

    const fetchTransactions = async () => {
        setLoading(true)
        try {
            const data = await TransactionService.list({ page, limit })
            setTransactions(data.results)
            setTotalCount(data.count)
        } catch (error) {
            console.error("Failed to fetch transactions:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTransactions()
    }, [page, limit])

    const handlePageChange = (newPage: number) => {
        setPage(newPage)
    }

    if (loading && transactions.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <p>Loading transactions...</p>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Transactions</h1>
            <DataTable
                columns={columns}
                data={transactions}
                totalCount={totalCount}
                page={page}
                limit={limit}
                onPageChange={handlePageChange}
            />
        </div>
    )
}
