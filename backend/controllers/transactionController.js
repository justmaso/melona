const prisma = require("../utils/db")
const { validateStringField, validateNumberField, validateBoolenField } = require("../utils/validators")
const { validateUtorid, validateTransactionType } = require("../utils/domainValidators")
const { BadRequestError, PermissionError, ExistenceError } = require("../utils/errors")

/**
 * POST /transactions
 * Creates a new purchase transaction.
 * 
 * - Case 77 (3/3)
 * - Case 78 (0/3)
 * - Case 79 (2/2)
 * - Case 80 (2/2)
 */
async function createTransaction(req, res, next) {
    try {
        let {
            utorid,
            type,
            spent,
            amount,
            relatedId,
            promotionIds,
            remark
        } = req.body

        validateUtorid(utorid)
        validateTransactionType(type)
        if (type === "adjustment" && req.user.role !== "manager" && req.user.role !== "superuser") {
            throw new PermissionError("Cannot create adjustment transaction")
        }

        const hasPromotionIds = Array.isArray(promotionIds) && promotionIds.length !== 0
        const hasRemark = remark != null && remark !== ""

        // get the "customer" user
        const user = await prisma.user.findUnique({ where: { utorid } })
        if (!user) {
            throw new BadRequestError("User not found")
        }

        let validPromotions = []
        if (hasPromotionIds) {
            // check that each promotion ID is a positive integer
            if (!promotionIds.every(pId => Number.isInteger(pId) && pId > 0)) {
                throw new BadRequestError("Promotion IDs must be an array of positive integers")
            }

            // get all the promotions in promotionIds
            const promotions = await prisma.promotion.findMany({
                where: { id: { in: promotionIds } }
            })

            // not all promotions exist
            if (promotions.length !== promotionIds.length) {
                throw new BadRequestError("One or more promotion IDs do not exist")
            }

            const now = new Date()

            const invalidTimePromotions = promotions.filter(p => now < p.startTime || p.endTime < now).map(p => p.id)
            
            const usedTransactions = await prisma.transaction.findMany({
                where: {
                    userId: user.id,
                    promotions: { some: { id: { in: promotionIds } } }
                },
                select: { promotions: { select: { id: true } } }
            })
            const usedPromotionIds = usedTransactions.flatMap(t => t.promotions.map(p => p.id))
            const invalidPromotionIds = promotionIds.filter(
                pId => invalidTimePromotions.includes(pId) || usedPromotionIds.includes(pId)
            )

            // at least one invalid promotion exists
            if (invalidPromotionIds.length > 0) {
                throw new BadRequestError("One or more promotions are expired or already used")
            }

            validPromotions = promotions
        }
        
        if (hasRemark) {
            validateStringField(remark, "Remark")
        }

        if (type === "purchase") {
            spent = validateNumberField(spent, "Spent", false, false)
            let earned = Math.floor(spent * 4)
            
            for (const promotion of validPromotions) {
                if (promotion.minSpending && spent < promotion.minSpending) continue
                if (promotion.points && promotion.points > 0) earned += promotion.points
                if (promotion.rate && promotion.rate > 0) earned += Math.floor(spent * 100 * promotion.rate)
            }

            const cashier = await prisma.user.findUnique({ where: { id: req.user.id } })
            const isCashierSuspicious = cashier.suspicious
    
            // create transaction
            const transaction = await prisma.transaction.create({
                data: {
                    userId: user.id,
                    type,
                    spent,
                    // earned: isCashierSuspicious ? 0 : earned,
                    earned,
                    remark: hasRemark ? remark : null,
                    suspicious: isCashierSuspicious,
                    promotions: hasPromotionIds
                        ? { connect: promotionIds.map(id => ({ id })) }
                        : undefined,
                    createdBy: req.user.utorid
                },
                include: {
                    promotions: true
                }
            })

            // only award points for non-suspicious requesting users
            if (!isCashierSuspicious) {
                await prisma.user.update({
                    where: { utorid },
                    data: { points: { increment: earned } }
                })
            }

            return res.status(201).json({
                id: transaction.id,
                utorid: user.utorid,
                type: transaction.type,
                spent: transaction.spent,
                // earned: transaction.earned,
                earned: isCashierSuspicious ? 0 : transaction.earned,
                remark: transaction.remark,
                promotionIds: transaction.promotions.map(p => p.id),
                createdBy: transaction.createdBy
            })
        }

        if (type === "adjustment") {
            amount = validateNumberField(amount, "Amount", true, true, false)
            relatedId = validateNumberField(relatedId, "Related ID")

            const relatedTransaction = await prisma.transaction.findUnique({ where: { id: relatedId } })
            if (!relatedTransaction) {
                throw new ExistenceError("Related transaction not found")
            }

            const transaction = await prisma.transaction.create({
                data: {
                    userId: user.id,
                    type,
                    amount,
                    relatedId,
                    remark: hasRemark ? remark : null,
                    promotions: hasPromotionIds
                        ? { connect: promotionIds.map(id => ({ id })) }
                        : undefined,
                    createdBy: req.user.utorid
                },
                include: { promotions: true }
            })

            await prisma.user.update({
                where: { id: user.id },
                data: { points: { increment: amount } }
            })

            return res.status(201).json({
                id: transaction.id,
                utorid: user.utorid,
                amount: transaction.amount,
                type: transaction.type,
                relatedId: transaction.relatedId,
                remark: transaction.remark,
                promotionIds: transaction.promotions.map(p => p.id),
                createdBy: transaction.createdBy
            })
        }
    } catch (error) {
        next(error)
    }
}

/**
 * GET /transactions
 * Retrieves a list of transactions.
 * 
 * - Case 94 (2/2)
 *     - GET_TX_REGULAR_403
 *     - ?
 * - Case 95 (2/2)
 *     - GET_TX_MANAGER_OK
 *     - ?
 */
async function getTransactions(req, res, next) {
    try {
        let {
            name,
            createdBy,
            suspicious,
            promotionId,
            type,
            relatedId,
            amount,
            operator,
            page = 1,
            limit = 10
        } = req.query

        page = validateNumberField(page, "Page")
        limit = validateNumberField(limit, "Limit")
        const skip = (page - 1) * limit

        const where = {}

        // (optional) filter by name (in utorid or name)
        if (name != null && name !== "") {
            where.user = {
                OR: [
                    { utorid: { contains: name } },
                    { name: { contains: name } }
                ]
            }
        }

        if (createdBy != null && createdBy !== "") {
            where.createdBy = createdBy
        }

        if (suspicious != null) {
            where.suspicious = validateBoolenField(suspicious, "Suspicious")

        }
        
        if (promotionId != null) {
            where.promotions = { some: { id: validateNumberField(promotionId, "Promotion ID") } }
        }

        if (type != null && type !== "") {
            validateTransactionType(type)
            where.type = type
        }

        if (relatedId != null) {
            if (!type) {
                throw new BadRequestError("Related ID must be used with the type parameter")
            }
            where.relatedId = validateNumberField(relatedId, "Related ID")
        }

        if (amount != null) {
            if (!operator) {
                throw new BadRequestError("Amount must be used with the operator parameter")
            }

            const pointAmount = validateNumberField(amount, "Amount")
            validateStringField(operator, 'Operator')
            if (operator === "gte") {
                where.amount = { gte: pointAmount }
            } else if (operator === "lte") {
                where.amount = { lte: pointAmount }
            } else {
                throw new BadRequestError("Operator must be 'gte'|'lte'")
            }
        }

        const count = await prisma.transaction.count({ where })

        const transactions = await prisma.transaction.findMany({
            where,
            include: {
                user: true,
                promotions: true
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit
        })

        const results = transactions.map(transaction => {
            const result = {
                id: transaction.id,
                utorid: transaction.user.utorid,
                type: transaction.type,
                promotionIds: transaction.promotions.map(p => p.id),
                remark: transaction.remark,
                createdBy: transaction.createdBy,
                createdAt: transaction.createdAt,
                suspicious: transaction.suspicious
            }

            switch (transaction.type) {
                case "purchase":
                    result.amount = transaction.amount
                    result.spent = transaction.spent
                    break
                case "redemption":
                    result.amount = -transaction.redeemed 
                    result.redeemed = transaction.redeemed
                    result.relatedId = transaction.relatedId
                    break
                case "adjustment":
                    result.amount = transaction.amount
                    result.relatedId = transaction.relatedId
                    break
                case "event":
                    result.amount = transaction.amount
                    result.awarded = transaction.amount
                    result.relatedId = transaction.relatedId
                    break
                case "transfer":
                    result.amount = transaction.sent
                    result.sent = transaction.sent
                    result.sender = transaction.sender
                    result.recipient = transaction.recipient
                    result.relatedId = transaction.relatedId
                    break
            }

            return result
        })

        return res.status(200).json({
            count,
            results
        })
    } catch (error) {
        next(error)
    }
}

/**
 * GET /transactions/:transactionId
 * Retrieves a single transaction.
 * 
 * - Case 96: ? (1/1)
 * - Case 97 (/2)
 *     - GET_TX_DETAILS_OK_SUSPICIOUS
 *     - ?
 */
async function getTransactionById(req, res, next) {
    try {
        let transactionId = validateNumberField(req.params.transactionId)

        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: {
                user: true,
                promotions: true
            }
        })

        if (!transaction) {
            throw new ExistenceError("Transaction not found")
        }

        const response = {
            id: transaction.id,
            utorid: transaction.user.utorid,
            type: transaction.type,
            spent: transaction.spent,
            amount: transaction.earned,
            promotionIds: transaction.promotions.map(p => p.id),
            suspicious: transaction.suspicious,
            remark: transaction.remark,
            createdBy: transaction.createdBy,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt
        }

        switch (transaction.type) {
            case "purchase":
                response.spent = transaction.spent
                response.earned = transaction.earned
                break
            case "adjustment":
                response.amount = transaction.amount
                response.relatedId = transaction.relatedId
                response.suspicious = transaction.suspicious
                break
            case "redemption":
                response.relatedId = transaction.relatedId
                response.redeemed = transaction.redeemed
                response.processedBy = transaction.processedBy
                break
            case "event":
                response.awarded = transaction.amount
                response.relatedId = transaction.relatedId
                break
            case "transfer":
                response.sender = transaction.sender
                response.recipient = transaction.recipient
                response.sent = transaction.sent
                break
        }

        return res.status(200).json(response)
    } catch (error) {
        next(error)
    }
}

/**
 * PATCH /transactions/:transactionId/suspicious
 * Marks or unmarks a transaction as suspicious.
 * 
 * - Case 84 (2/2)
 *     - FLAG_SUSPICIOUS_OK
 *     - ?
 * - Case 85 (2/2)
 *     - UNFLAG_SUSPICIOUS_OK
 * - Case 86: FLAG_SUSPICIOUS_403 (1/1)
 */
// async function setSuspicious(req, res, next) {
//     try {
//         const transactionId = validateNumberField(req.params.transactionId, "Transaction ID")
//         const suspicious = validateBoolenField(req.body.suspicious, "Suspicious")

//         const transaction = await prisma.transaction.findUnique({
//             where: { id: transactionId },
//             include: { user: true }
//         })
//         if (!transaction) {
//             throw new ExistenceError("Transaction not found")
//         }

//         // check if the transaction is already what the update is for
//         if (transaction.suspicious && suspicious) {
//             throw new BadRequestError("Transaction is already suspicious")
//         } else if (!transaction.suspicious && !suspicious) {
//             throw new BadRequestError("Transaction is already not suspicious")
//         }

//         // mark the transaction as supicious or not + update the user's point balance
//         const [updatedTransaction, updatedUser] = await Promise.all([
//             prisma.transaction.update({
//                 where: { id: transactionId },
//                 data: {
//                     suspicious
//                 },
//                 include: {
//                     user: true,
//                     promotions: true
//                 }
//             }),
//             prisma.user.update({
//                 where: { id: transaction.user.id },
//                 data: {
//                     points: suspicious
//                         ? { decrement: transaction.earned }
//                         : { increment: transaction.earned }
//                 }
//             })
//         ])

//         return res.status(200).json({
//             id: updatedTransaction.id,
//             utorid: updatedTransaction.user.utorid,
//             type: updatedTransaction.type,
//             spent: updatedTransaction.spent,
//             amount: updatedTransaction.earned,
//             promotionIds: updatedTransaction.promotions.map(p => p.id),
//             suspicious: updatedTransaction.suspicious,
//             remark: updatedTransaction.remark,
//             createdBy: updatedTransaction.createdBy
//         })
//     } catch (error) {
//         next(error)
//     }
// }

async function setSuspicious(req, res, next) {
    try {
        const transactionId = validateNumberField(req.params.transactionId, "Transaction ID")
        const suspicious = validateBoolenField(req.body.suspicious, "Suspicious")

        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { user: true }
        })
        if (!transaction) {
            throw new ExistenceError("Transaction not found")
        }

        // check if the transaction is already what the update is for
        if (transaction.suspicious && suspicious) {
            throw new BadRequestError("Transaction is already suspicious")
        } else if (!transaction.suspicious && !suspicious) {
            throw new BadRequestError("Transaction is already not suspicious")
        }

        // mark the transaction as suspicious or not + update the user's point balance
        const pointsChange = transaction.earned || 0
        const [updatedTransaction, updatedUser] = await Promise.all([
            prisma.transaction.update({
                where: { id: transactionId },
                data: {
                    suspicious
                },
                include: {
                    user: true,
                    promotions: true
                }
            }),
            prisma.user.update({
                where: { id: transaction.user.id },
                data: {
                    points: suspicious
                        ? { decrement: pointsChange }
                        : { increment: pointsChange }
                }
            })
        ])

        return res.status(200).json({
            id: updatedTransaction.id,
            utorid: updatedTransaction.user.utorid,
            type: updatedTransaction.type,
            spent: updatedTransaction.spent,
            earned: updatedTransaction.earned,
            promotionIds: updatedTransaction.promotions.map(p => p.id),
            suspicious: updatedTransaction.suspicious,
            remark: updatedTransaction.remark,
            createdBy: updatedTransaction.createdBy
        })
    } catch (error) {
        next(error)
    }
}

/**
 * PATCH /transactions/:transactionId/processed
 * Marks a redemption transaction as complete.
 * 
 * - Case 91 (0/2)
 *     - PROCESS_REDEMPTION_OK
 *     - ?
 * - Case 92: PROCESS_REDEMPTION_ALREADY (0/1)
 * - Case 93: PROCESS_REDEMPTION_403 (1/1)
 */
async function processRedemptionTransaction(req, res, next) {
    try {
        const transactionId = validateNumberField(req.params.transactionId, "Transaction ID")
        const processed = validateBoolenField(req.body.processed, "Processed")
        if (!processed) {
            throw new BadRequestError("Processed must be true")
        }

        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { user: true }
        })
        if (!transaction) {
            throw new ExistenceError("Transaction not found")
        } else if (transaction.type !== "redemption") {
            throw new BadRequestError("Transaction is not of type 'redemption'")
        } else if (transaction.processedBy !== null) {
            throw new BadRequestError("Transaction has already been processed")
        }

        // take away from the user's points
        const updatedUser = await prisma.user.update({
            where: { id: transaction.userId },
            data: {
                points: { decrement: transaction.redeemed }
            }
        })

        // mark the transaction as processed
        const processedTransaction = await prisma.transaction.update({
            where: { id: transactionId },
            data: {
                processedBy: req.user.utorid
            },
            select: {
                id: true,
                type: true,
                processedBy: true,
                redeemed: true,
                remark: true,
                createdBy: true
            }
        })

        return res.status(200).json({
            ...processedTransaction,
            utorid: updatedUser.utorid
        })
    } catch (error) {
        next(error)
    }
}


module.exports = {
    createTransaction,
    getTransactions,
    getTransactionById,
    setSuspicious,
    processRedemptionTransaction
}