import { Promotion } from "@/models";
import { api } from "../api";
import { CreatePromotionInput, UpdatePromotionInput } from "../validation";

export const PromotionService = {
    list: async (params: { page: number; limit: number }) => {
        const response = await api.get("/promotions", { params })
        return response.data as { count: number; results: Promotion[] }
    },
    get: async (promotionId: number) => {
        const response = await api.get<Promotion>(`promotions/${promotionId}`)
        return response.data
    },
    create: async (dto: CreatePromotionInput) => {
        try {
            console.log("Creating promotion:", dto)
            
            // Remove empty optional fields and fix dates
            const cleanedDto: any = {
                name: dto.name,
                description: dto.description,
                type: dto.type,
                startTime: dto.startTime ? `${dto.startTime}T12:00:00.000Z` : dto.startTime,
                endTime: dto.endTime ? `${dto.endTime}T12:00:00.000Z` : dto.endTime
            }
            
            // Only include optional fields if they have values
            if (dto.minSpending && dto.minSpending !== "") {
                cleanedDto.minSpending = parseFloat(dto.minSpending)
            }
            
            if (dto.rate && dto.rate !== "") {
                cleanedDto.rate = parseFloat(dto.rate)
            }
            
            if (dto.points && dto.points !== "") {
                cleanedDto.points = parseInt(dto.points)
            }
            
            console.log("Cleaned data for backend:", cleanedDto)
            const response = await api.post("/promotions", cleanedDto)
            console.log("Promotion created successfully:", response.data)
            return response.data
        } catch (error: any) {
            if (error.response) {
                console.error("Backend error:", {
                    status: error.response.status,
                    data: error.response.data
                })
                
                const backendError = error.response.data?.error || error.response.data?.message
                throw new Error(backendError || `Server error (${error.response.status})`)
            } else if (error.request) {
                console.error("No response from server:", error.request)
                throw new Error("Unable to reach the server. Please check your connection.")
            } else {
                console.error("Error creating promotion:", error.message)
                throw new Error(error.message || "An unexpected error occurred")
            }
        }
    },
    update: async (promotionId: number, dto: Partial<UpdatePromotionInput>) => {
        try {
            console.log("Updating promotion:", promotionId, dto)
            
            const updatePayload: any = {}
            
            if (dto.name && dto.name !== "") {
                updatePayload.name = dto.name
            }
            
            if (dto.description && dto.description !== "") {
                updatePayload.description = dto.description
            }
            
            if (dto.type && (dto.type == "one-time" || dto.type === "automatic")) {
                updatePayload.type = dto.type
            }
            
            if (dto.startTime && dto.startTime !== "") {
                updatePayload.startTime = `${dto.startTime}T12:00:00.000Z`
            }
            
            if (dto.endTime && dto.endTime !== "") {
                updatePayload.endTime = `${dto.endTime}T12:00:00.000Z`
            }
            
            if (dto.minSpending !== undefined) {
                updatePayload.minSpending = dto.minSpending === "" ? null : parseFloat(dto.minSpending)
            }
            
            if (dto.rate !== undefined) {
                updatePayload.rate = dto.rate === "" ? null : parseFloat(dto.rate)
            }
            
            if (dto.points !== undefined) {
                updatePayload.points = dto.points === "" ? null : parseInt(dto.points)
            }
            
            console.log("Cleaned update payload:", updatePayload)
            const response = await api.patch(`/promotions/${promotionId}`, updatePayload)
            console.log("Promotion updated successfully:", response.data)
            return response.data
        } catch (error: any) {
            if (error.response) {
                console.error("Backend error:", {
                    status: error.response.status,
                    data: error.response.data
                })
                
                const backendError = error.response.data?.error || error.response.data?.message
                throw new Error(backendError || `Server error (${error.response.status})`)
            } else if (error.request) {
                console.error("No response from server:", error.request)
                throw new Error("Unable to reach the server. Please check your connection.")
            } else {
                console.error("Error updating promotion:", error.message)
                throw new Error(error.message || "An unexpected error occurred")
            }
        }
    },
    delete: async (promotionId: number) => {
        const response = await api.delete(`/promotions/${promotionId}`)
        return response.data
    }
}
