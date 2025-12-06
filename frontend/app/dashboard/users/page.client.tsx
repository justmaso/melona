"use client"

import { DataTable } from "./data-table"
import { columns } from "./columns"
import { UserService } from "@/lib/services/user"
import { useEffect, useState } from "react"
import { User } from "@/models"

export default function UsersPageClient() {
    const [users, setUsers] = useState<User[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [loading, setLoading] = useState(false)

    const fetchUsers = async () => {
        setLoading(true)
        try {
            // const result = await getUsers({ page, limit })
            const data = await UserService.list({ page, limit })
            setUsers(data.results)
            setTotalCount(data.count)
        } catch (error) {
            console.error("Failed to fetch users:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [page, limit])

    const handlePageChange = (newPage: number) => {
        setPage(newPage)
    }

    const handleUserCreated = () => {
        // reset to page 1 and refetch new user
        setPage(1)
        fetchUsers()
    }

    if (loading && users.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <p>Loading users...</p>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Users</h1>
            <DataTable
                columns={columns}
                data={users}
                totalCount={totalCount}
                page={page}
                limit={limit}
                onPageChange={handlePageChange}
                onUserCreated={handleUserCreated}
            />
        </div>
    )
}
