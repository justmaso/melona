import { z } from "zod"
import { utorid } from "./fields"

export const promotionIds = z
    .string()
    .optional()
    .refine((val => !val || val.split(",").every(v => !isNaN(Number(v)))), {
        message: "Promotion IDs must be numbers"
    })
export const remark = z.string().optional()

// backend expects utorid, type, spent, promotionIds, remark
export const CreatePurchaseTransactionSchema = z.object({
    utorid,
    type: z.literal("purchase"),
    spent: z.number().positive(),
    promotionIds,
    remark
})

// backend expects utorid, type, amount, relatedId, promotionIds, remark
export const CreateAdjustmentTransactionSchema = z.object({
    utorid,
    type: z.literal("adjustment"),
    amount: z.number(),
    relatedId: z.number(),
    promotionIds,
    remark
})

// backend expects type, amount, remark (stores as "redeemed")
export const CreateRedemptionTransactionSchema = z.object({
    type: z.literal("redemption"),
    amount: z.number().positive().int(),
    remark
})

// function to check against the user point balance
export const createRedemptionTransactionSchema = (userPoints: number) => z.object({
    type: z.literal("redemption"),
    amount: z.number()
        .positive("Amount must be positive")
        .int("Amount must be a positive integer")
        .max(userPoints, `Amount exceeds current point balance of ${userPoints}`),
    remark
})

// backend expects: type, amount, remark (stores as "sent")
export const CreateTransferTransactionSchema = z.object({
    type: z.literal("transfer"),
    // recipientId: z.number().positive("Recipient ID must be positive"),
    recipientUtorid: utorid,
    amount: z.number().positive(),
    remark
})

export const createTransferTransactionSchema = (userPoints: number) => z.object({
    type: z.literal("transfer"),
    // recipientId: z.number().positive("Recipient ID must be positive"),
    recipientUtorid: utorid,
    amount: z.number()
        .positive("Amount must be positive")
        .int("Amount must be a positive integer")
        .max(userPoints, `Amount exceeds current point balance of ${userPoints}`),
    remark
})

export type CreatePurchaseTransactionInput = z.infer<typeof CreatePurchaseTransactionSchema>
export type CreateAdjustmentTransactionInput = z.infer<typeof CreateAdjustmentTransactionSchema>
export type CreateRedemptionTransactionInput = z.infer<typeof CreateRedemptionTransactionSchema>
export type CreateTransferTransactionInput = z.infer<typeof CreateTransferTransactionSchema>

// import { z } from "zod"
// import { utorid } from "./fields"

// export const promotionIds = z
//     .string()
//     .optional()
//     .refine((val => !val || val.split(",").every(v => !isNaN(Number(v)))), {
//         message: "Promotion IDs must be numbers"
//     })
// export const remark = z.string().optional()

// // backend expects utorid, type, spent, promotionIds, remark
// export const CreatePurchaseTransactionSchema = z.object({
//     utorid,
//     type: z.literal("purchase"),
//     spent: z.number().positive(),
//     promotionIds,
//     remark
// })

// // backend expects utorid, type, amount, relatedId, promotionIds, remark
// export const CreateAdjustmentTransactionSchema = z.object({
//     utorid,
//     type: z.literal("adjustment"),
//     amount: z.number(),
//     relatedId: z.number(),
//     promotionIds,
//     remark
// })

// // backend expects type, amount, remark (stores as "redeemed")
// export const CreateRedemptionTransactionSchema = z.object({
//     type: z.literal("redemption"),
//     amount: z.number().positive().int(),
//     remark
// })

// // function to check against the user point balance
// export const createRedemptionTransactionSchema = (userPoints: number) => z.object({
//     type: z.literal("redemption"),
//     amount: z.number()
//         .positive("Amount must be positive")
//         .int("Amount must be a positive integer")
//         .max(userPoints, `Amount exceeds current point balance of ${userPoints}`),
//     remark
// })

// // backend expects: type, amount, remark (stores as "sent")
// export const CreateTransferTransactionSchema = z.object({
//     type: z.literal("transfer"),
//     amount: z.number().positive(),
//     remark
// }) satisfies z.ZodType<CreateTransferTransactionInput>

// export const createTransferTransactionSchema = (userPoints: number) => z.object({
//     type: z.literal("transfer"),
//     amount: z.number()
//         .positive("Amount must be positive")
//         .int("Amount must be a positive integer")
//         .max(userPoints, `Amount exceeds current point balance of ${userPoints}`),
//     remark
// })

// export type CreatePurchaseTransactionInput = z.infer<typeof CreatePurchaseTransactionSchema>
// export type CreateAdjustmentTransactionInput = z.infer<typeof CreateAdjustmentTransactionSchema>
// export type CreateRedemptionTransactionInput = z.infer<typeof CreateRedemptionTransactionSchema>
// export type CreateTransferTransactionInput = z.infer<typeof CreateTransferTransactionSchema>