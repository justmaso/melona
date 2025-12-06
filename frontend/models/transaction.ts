export type TransactionType =
    | "purchase"
    | "redemption"
    | "adjustment"
    | "transfer"

export interface Transaction {
    id: number
    userId?: number
    type: TransactionType

    // purchase
    spent?: number
    earned?: number

    // adjustment
    amount?: number
    relatedId?: number

    // redemption
    redeemed?: number
    processedBy?: string

    // transfer
    sender?: string
    recipient?: string
    sent?: number

    // shared fields
    remark?: string
    suspicious: boolean
    createdBy: string

    createdAt: string
    updatedAt: string

    promotionIds?: number[]
}