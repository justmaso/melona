import { api } from "../api"
import { Transaction } from "@/models"

export const TransactionService = {
    list: async (params: { page: number; limit: number }) => {
        const response = await api.get("/transactions", { params })
        return response.data as { count: number; results: Transaction[] }
    },
    get: async (transactionId: number, isOwnTransaction = false) => {
        const endpoint = isOwnTransaction
            ? `/users/me/transactions/${transactionId}`
            : `/transactions/${transactionId}`
        const response = await api.get<Transaction>(endpoint)
        return response.data
    },
    create: async (dto: Partial<Transaction>) => {
        const response = await api.post("/transactions", dto)
        return response.data
    },
    setSuspicious: async (transactionId: number, suspicious: boolean) => {
        const response = await api.patch(`/transactions/${transactionId}/suspicious`, { suspicious })
        return response.data
    },
    processRedemption: async (transactionId: number) => {
        const response = await api.patch(`/transactions/${transactionId}/processed`, { processed: true })
        return response.data
    }
}
