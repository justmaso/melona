"use client"

import { DataTable } from "./data-table"
import { columns } from "./columns"
import { PromotionService } from "@/lib/services/promotion"
import { Promotion } from "@/models"
import { useEffect, useState } from "react"

export default function PromotionsPageClient() {
    const [promotions, setPromotions] = useState<Promotion[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [loading, setLoading] = useState(false)

    const fetchPromotions = async () => {
        setLoading(true)
        try {
            const data = await PromotionService.list({ page, limit })
            setPromotions(data.results)
            setTotalCount(data.count)
        } catch (error) {
            console.error("Failed to fetch promotions:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPromotions()
    }, [page, limit])

    const handlePageChange = (newPage: number) => {
        setPage(newPage)
    }

    if (loading && promotions.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <p>Loading promotions...</p>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Promotions</h1>
            <DataTable
                columns={columns}
                data={promotions}
                totalCount={totalCount}
                page={page}
                limit={limit}
                onPageChange={handlePageChange}
            />
        </div>
    )
}
