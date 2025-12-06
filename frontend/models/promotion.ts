export type PromotionType = "automatic" | "one-time"

export interface Promotion {
    id: number
    name: string
    description: string
    type: PromotionType
    rate: number
    points: number
    minSpending: number
    startTime?: string
    endTime: string
}