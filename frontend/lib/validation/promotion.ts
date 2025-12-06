import { z } from "zod"

export const promotionName = z.string().min(1, "Name is required")
export const promotionDescription = z.string().min(1, "Description is required")
export const promotionType = z.enum(["one-time", "automatic"]).refine((val) => !!val, { message: "Promotion type is required"})

export const CreatePromotionSchema = z.object({
    name: promotionName,
    description: promotionDescription,
    type: promotionType,
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    minSpending: z.string().optional().or(z.literal("")),
    rate: z.string().optional().or(z.literal("")),
    points: z.string().optional().or(z.literal(""))
}).refine((data) => {
    if (!data.startTime || !data.endTime) return true
    const start = new Date(data.startTime)
    const end = new Date(data.endTime)
    return end > start
}, {
    message: "End time must be after start time",
    path: ["endTime"]
}).refine((data) => {
    if (!data.minSpending || data.minSpending === "") return true
    const num = parseFloat(data.minSpending)
    return !isNaN(num) && num > 0
}, {
    message: "Minimum spending must be a positive number",
    path: ["minSpending"]
}).refine((data) => {
    if (!data.rate || data.rate === "") return true
    const num = parseFloat(data.rate)
    return !isNaN(num) && num > 0
}, {
    message: "Rate must be a positive number",
    path: ["rate"]
}).refine((data) => {
    if (!data.points || data.points === "") return true
    const num = parseInt(data.points)
    return !isNaN(num) && num > 0
}, {
    message: "Points must be a positive number",
    path: ["points"]
})

export const UpdatePromotionSchema = z.object({
    name: promotionName.optional(),
    description: promotionDescription.optional(),
    type: promotionType.optional(),
    startTime: z.string().optional().or(z.literal("")),
    endTime: z.string().optional().or(z.literal("")),
    minSpending: z.string().optional().or(z.literal("")),
    rate: z.string().optional().or(z.literal("")),
    points: z.string().optional().or(z.literal(""))
}).refine((data) => {
    if (data.startTime && data.endTime && data.startTime !== "" && data.endTime !== "") {
        const start = new Date(data.startTime)
        const end = new Date(data.endTime)
        return end > start
    }
    return true
}, {
    message: "End time must be after start time",
    path: ["endTime"]
}).refine((data) => {
    if (!data.minSpending || data.minSpending === "") return true
    const num = parseFloat(data.minSpending)
    return !isNaN(num) && num >= 0
}, {
    message: "Minimum spending must be a positive number",
    path: ["minSpending"]
}).refine((data) => {
    if (!data.rate || data.rate === "") return true
    const num = parseFloat(data.rate)
    return !isNaN(num) && num >= 0
}, {
    message: "Rate must be a positive number",
    path: ["rate"]
}).refine((data) => {
    if (!data.points || data.points === "") return true
    const num = parseInt(data.points)
    return !isNaN(num) && num >= 0
}, {
    message: "Points must be a positive number",
    path: ["points"]
})

export type CreatePromotionInput = z.infer<typeof CreatePromotionSchema>
export type UpdatePromotionInput = z.infer<typeof UpdatePromotionSchema>
