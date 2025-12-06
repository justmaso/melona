import { LoginResponse, ResetTokenResponse } from "@/models";
import { api } from "../api";

export const AuthService = {
    login: async (utorid: string, password: string) => {
        const response = await api.post<LoginResponse>("/auth/tokens", { utorid, password })
        return response.data
    },
    requestPasswordReset: async (utorid: string) => {
        const response = await api.post("/auth/resets", { utorid })
        return response.data
    },
    resetPasswordViaResetToken: async (resetToken: string, utorid: string, password: string) => {
        const response = await api.post(`/auth/resets/${resetToken}`, { utorid, password })
        return response.data
    },
    verifyResetToken: async (resetToken: string) => {
        const response = await api.get<ResetTokenResponse>(`/auth/resets/${resetToken}`)
        return response.data
    }
}
