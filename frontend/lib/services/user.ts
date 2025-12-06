import { api } from "../api"
import { Transaction, User } from "@/models"

export const UserService = {
    list: async (params?: { page?: number; limit?: number }) => {
        const response = await api.get<{ results: User[]; count: number }>("/users", { params })
        return response.data
    },
    get: async (userId: string | number) => {
        const response = await api.get<User>(`/users/${userId}`)
        return response
    },
    create: async (dto: Partial<User>) => {
        const response = await api.post("/users", dto)
        return response
    },
    update: async (userId: string | number, dto: Partial<User>) => {
        const response = await api.patch(`/users/${userId}`, dto)
        return response
    },
    me: async () => {
        const response = await api.get<User>("/users/me")
        return response
    },
    updateMe: async (dto: Partial<User>) => {
        const response = await api.patch("/users/me", dto)
        return response
    },
    updatePassword: async (newPassword: string) => {
        const response = await api.patch("/users/me/password", { password: newPassword })
        return response
    },
    createMyRedemption: async (dto: { amount: number; remark?: string }) => {
        const response = await api.post<Transaction>("/users/me/transactions", dto)
        return response
    },
    getMyTransactions: async (params?: { page?: number; limit?: number }) => {
        const response = await api.get<{ results: Transaction[]; count: number }>("/users/me/transactions", { params })
        return response.data
    },
    transfer: async (userId: string | number, dto: { amount: number; remark?: string }) => {
        console.log(userId, dto)
        const response = await api.post(`/users/${userId}/transactions`, dto)
        return response
    },
    getByUtorid: async (utorid: string) => {
        const response = await api.get(`/users/utorid/${utorid}`)
        return response
    }
}
