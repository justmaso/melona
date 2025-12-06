const prisma = require("../utils/db")
const { v4: uuidv4 } = require("uuid")
const bcrypt = require("bcrypt")
const { validateUtorid, validateName, validateUofTEmail, validateUserId, validateBirthday, validatePassword, validateTransactionType } = require("../utils/domainValidators")
const { validateNumberField, validateStringField, validateBoolenField } = require("../utils/validators")
const { BadRequestError, ExistenceError, PermissionError, ConflictError } = require("../utils/errors")

/**
 * `POST /users`
 * Registers a new user.
 * 
 * - Case 4 (10/10)
 * - Case 5 (1/1)
 * - Case 6 (1/1)
 * - Case 17 (1/1)
 * - Case 18 (2/2)
 */
async function createUser(req, res, next) {
    try {
        const { utorid, name, email } = req.body || {}

        validateUtorid(utorid)
        validateName(name)
        validateUofTEmail(email)

        // check if a user already exists with this utorid
        const userByUtorid = await prisma.user.findUnique({ where: { utorid } })
        if (userByUtorid) {
            throw new ConflictError("UTORid already taken")
        }

        // check if a user already exists with this email
        const userByEmail = await prisma.user.findUnique({ where: { email } })
        if (userByEmail) {
            throw new ConflictError("Email already taken")
        }

        // define the reset token that expires exactly 7 days after right now
        const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000)
        const resetToken = uuidv4()

        // create the user
        const user = await prisma.user.create({
            data: {
                utorid,
                name,
                email,
                expiresAt,
                resetToken
            }
        })

        return res.status(201).json({
            id: user.id,
            utorid: user.utorid,
            name: user.name,
            email: user.email,
            verified: user.verified,
            expiresAt,
            resetToken
        })
    } catch (error) {
        next(error)
    }
}

/**
 * `GET /users`
 * Retrieves a list of users.
 * 
 * - Case 19 (1/1)
 * - Case 20 (1/1)
 * - Case 21 (7/7)
 */
async function getUsers(req, res, next) {
    try {
        const {
            name,
            role,
            verified,
            activated
        } = req.query

        const page = req.query.page ? Number(req.query.page) : 1
        const limit = req.query.limit ? Number(req.query.limit) : 10

        if (req.query.page) validateNumberField(page, "Page")
        if (req.query.limit) validateNumberField(limit, "Limit")

        const verifiedFilter = verified !== undefined
            ? validateBoolenField(verified, "Verified", false)
            : undefined
        const activatedFilter = activated !== undefined
            ? validateBoolenField(activated, "Activated", false)
            : undefined

        const filter = {}

        // dynamically build the filter based on the query
        if (name) filter.OR = [{ utorid: { contains: name } }, { name: { contains: name } }]
        if (role) filter.role = role
        if (verifiedFilter !== undefined) filter.verified = verifiedFilter
        if (activatedFilter !== undefined) filter.lastLogin = activatedFilter ? { not: null } : null

        // first, get the users (i.e., results)
        const results = await prisma.user.findMany({
            where: filter,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { id: "asc" },
            select: {
                id: true,
                utorid: true,
                name: true,
                email: true,
                birthday: true,
                role: true,
                points: true,
                createdAt: true,
                lastLogin: true,
                verified: true,
                avatarUrl: true
            }
        })

        // get the total number of users
        const count = await prisma.user.count({ where: filter })

        return res.status(200).json({ count, results })
    } catch (error) {
        next(error)
    }
}

/**
 * `GET /users/:userId`
 * Retrieves a specific user.
 * 
 * - Case 28 (1/1)
 * - Case 29 (2/2)
 */
async function getUserById(req, res, next) {
    try {
        const requestingUser = req.user
        const userId = validateUserId(req.params.userId)

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                promotions: {
                    where: {
                        // used: false, REMOVED
                        type: "onetime",
                        // startTime: { lte: new Date() },
                        // endTime: { gte: new Date() },
                        // transactions: { none: { userId } }
                    },
                    select: {
                        id: true,
                        name: true,
                        minSpending: true,
                        rate: true,
                        points: true
                    }
                }
            }
        })
        if (!user) {
            const error = new Error("User not found")
            error.status = 404
            throw error
        }

        // build the response object based on the requesting user's role
        let response = {
            id: user.id,
            utorid: user.utorid,
            name: user.name,
            points: user.points,
            // verified: user.lastLogin !== null,
            verified: user.verified,
            promotions: user.promotions
        }
        
        // managers (or higher) get an enhanced view
        if (requestingUser.role === "manager" || requestingUser.role === "superuser") {
            response = {
                ...response,
                email: user.email,
                birthday: user.birthday,
                role: user.role,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin,
                avatarUrl: user.avatarUrl,
                suspicious: user.suspicious
            }
        }

        return res.status(200).json(response)
    } catch (error) {
        next(error)
    }
}

/**
 * `PATCH /users/:userId`
 * Updates a specific uesr's varius statuses and information.
 * 
 * - Case 22 (5/5)
 * - Case 23 (1/1)
 * - Case 24 (1/1)
 * - Case 25 (1/1)
 * - Case 26 (1/1)
 * - Case 27 (1/1)
 */
async function updateUser(req, res, next) {
    try {
        const requestingUser = req.user
        const userId = validateUserId(req.params.userId)
        const { email, verified, suspicious, role } = req.body || {}

        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) {
            const error = new Error("User not found")
            error.status = 404
            throw error
        }

        const hasEmail = email != null && email !== ""
        const hasVerified = verified != null
        const hasSuspicious = suspicious != null
        const hasRole = role != null && role !== ""

        if (!hasEmail && !hasVerified && !hasSuspicious && !hasRole) {
            const error = new Error("At least one payload field must be present")
            error.status = 400
            throw error
        }

        const updateData = {}

        if (hasEmail && email !== user.email) {
            validateUofTEmail(email)

            // check if a user exists already uses this email
            const userByEmail = await prisma.user.findUnique({ where: { email } })
            if (userByEmail) {
                throw new ConflictError("Email already taken")
            }

            updateData.email = email
        }

        if (hasVerified) {
            if (!verified) {
                const error = new Error("Verified must be set to true if passed")
                error.status = 400
                throw error
            }
            updateData.verified = true
        }

        if (hasSuspicious) updateData.suspicious = suspicious

        if (hasRole) {
            if (requestingUser.role === "manager") {
                if (role !== "cashier" && role !== "regular") {
                    const error = new Error("Managers can only assign 'cashier' or 'regular' roles")
                    error.status = 403 // ?? or 400
                    throw error
                }
            // authorization middleware ensures the below is for a superuser
            } else {
                if (!["regular", "cashier", "manager", "superuser"].includes(role)) {
                    const error = new Error("Invalid role passed for superuser to update")
                    error.status = 400
                    throw error
                }
            }

            // only non-suspicious users can be promoted to cashier
            if (role === "cashier" && user.suspicious) {
                const error = new Error("Suspicious users cannot become cashiers")
                error.status = 400
                throw error
            }
            updateData.role = role

            if (role === "cashier") updateData.suspicious = false
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                utorid: true,
                name: true,
                // BELOW: causes tests to fail for some reason
                // email: hasEmail && updateData.email !== user.email,
                // verified: hasVerified && updateData.email !== user.verified,
                // suspicious: hasSuspicious && updateData.suspicious !== user.suspicious,
                // role: hasRole && updateData.role !== user.role
                ...(hasEmail && { email: true }),
                ...(hasVerified && { verified: true }),
                ...(hasSuspicious && { suspicious: true }),
                ...(hasRole && { role: true })
            }
        })

        return res.status(200).json(updatedUser)
    } catch (error) {
        next(error)
    }
}

/**
 * `PATCH /users/me`
 * Updates the current logged-in user's information.
 * 
 * - Case 33 (7/7)
 * - Case 34 (1/1)
 */
async function updateCurrentUser(req, res, next) {
    try {
        const {
            name,
            email,
            birthday,
            avatar
        } = req.body
        const userId = req.user.id

        const hasName = name != null && name !== ""
        const hasEmail = email != null && email !== ""
        const hasBirthday = birthday != null && birthday !== ""
        const hasAvatar = avatar != null && avatar !== ""

        if (hasName) validateName(name)
        if (hasEmail) validateUofTEmail(email)
        if (hasBirthday) validateBirthday(birthday)
        // if (hasAvatar) 

        if (!hasName && !hasEmail && !hasBirthday) {
            const error = new Error("At least one payload field must be present")
            error.status = 400
            throw error
        }
        // check at least one field is in the payload
        // if (name === undefined && email === undefined && birthday === undefined && !req.file) {
        //     const error = new Error("At least one payload attribute must be present")
        //     error.status = 400
        //     throw error
        // }

        // if (name !== undefined) validateName(name)
        // if (email !== undefined) validateUofTEmail(email)
        // if (birthday !== undefined) validateBirthday(birthday)

        const user = await prisma.user.findUnique({ where: { id: userId }})
        if (!user) {
            const error = new Error("User not found")
            error.status = 404
            throw error
        }

        const patchedData = {}
        if (hasName) patchedData.name = name
        if (hasEmail && email != user.email) {
            const newEmailInUse = await prisma.user.findUnique({ where: { email } })
            if (newEmailInUse) {
                throw new ConflictError("Email already taken")
            }
            
            patchedData.email = email
        }
        if (hasBirthday) patchedData.birthday = new Date(birthday)
        if (hasAvatar) patchedData.avatarUrl = `/uploads/avatars/${req.file.filename}`
        // if (name !== undefined) patchedData.name = name
        // if (email !== undefined) patchedData.email = email
        // if (birthday !== undefined) patchedData.birthday = new Date(birthday)
        // if (req.file) patchedData.avatarUrl = `/uploads/avatars/${req.file.filename}`

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: patchedData,
            select: {
                id: true,
                utorid: true,
                name: true,
                email: true,
                birthday: true,
                role: true,
                points: true,
                createdAt: true,
                lastLogin: true,
                verified: true,
                avatarUrl: true,
            }
        })

        return res.status(200).json({
            ...updatedUser,
            birthday: updatedUser.birthday
                ? updatedUser.birthday.toISOString().split("T")[0]
                : null
        })
    } catch (error) {
        next(error)
    }
}

/**
 * `GET /users/me`
 * Retrieves the currently logged-in user's information.
 * 
 * - Case 35 (2/2)
 */
async function getCurrentUser(req, res, next) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                promotions: {
                    where: {
                        // used: false,
                        type: "onetime"
                    },
                    select: {
                        id: true,
                        name: true,
                        minSpending: true,
                        rate: true,
                        points: true
                    }
                }
            }
        })

        if (!user) {
            const error = new Error("User not found")
            error.status = 404
            throw error
        }

        return res.status(200).json({
            id: user.id,
            utorid: user.utorid,
            name: user.name,
            email: user.email,
            birthday: user.birthday,
            role: user.role,
            points: user.points,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            verified: user.lastLogin !== null,
            avatarUrl: user.avatarUrl,
            promotions: user.promotions
        })
    } catch (error) {
        next(error)
    }
}

/**
 * `PATCH /users/me/password`
 * Updates the currently logged-in user's password.
 * 
 * - Case 30 (1/1)
 * - Case 31 (6/6)
 * - Case 32 (1/1)
 */
async function updateCurrentUserPassword(req, res, next) {
    try {
        const userId = req.user.id
        const { old: oldPassword, new: newPassword } = req.body

        validateStringField(oldPassword, "Old password")
        validateStringField(newPassword, "New password")

        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) {
            const error = new Error("User not found")
            error.message = 404
            throw error
        }

        // check if the old password matches the current one
        const passwordsMatch = await bcrypt.compare(oldPassword, user.password)
        if (!passwordsMatch) {
            const error = new Error("Old password doesn't match current password")
            error.status = 403
            throw error
        }

        // check that the new password is valid
        validatePassword(newPassword, "New password")
        
        // (optional) hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // update the user's password
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        })

        return res.status(200).json({ message: "Password updated successfully" })
    } catch (error) {
        next(error)
    }
}

/**
 * POST /users/:userId/transactions
 * Creates a new transfer transaction between the currently logged in user
 * (i.e., the sender) and the user specified by userId (i.e., the recipient).
 * 
 * - Case 87 (0/2)
 *     - TRANSFER_OK
 *     - ?
 * - Case 88: TRANSFER_INSUFFICIENT (1/1)
 */
async function createTransferTransaction(req, res, next) {
    try {
        // console.log('=== CREATE TRANSFER TRANSACTION DEBUG ===')
        // console.log('Request params:', req.params)
        // console.log('Request body:', JSON.stringify(req.body, null, 2))
        // console.log('Request user:', req.user)
        const userId = validateNumberField(req.params.userId, "User ID")
        // console.log('Validated userId:', userId)

        let {
            type,
            amount,
            remark
        } = req.body

        // console.log('Validating transaction type:', type)
        validateTransactionType(type)

        if (type !== "transfer") {
            throw new BadRequestError("Type must be 'transfer' for transfer transactions")
        }

        // console.log('Validating amount:', amount)
        amount = validateNumberField(amount, "Amount")
        // console.log('Validated amount:', amount)

        const hasRemark = remark != null && remark !== ""
        // console.log('Has remark?', hasRemark, 'remark value:', remark)

        if (hasRemark) {
            // console.log("Validating remark string")
            validateStringField(remark, "Remark", false)
            // console.log("Remark validated successfully")
        }

        // console.log("Finding sender with utorid:", req.user.utorid)
        const sender = await prisma.user.findUnique({ where: { utorid: req.user.utorid } })
        if (!sender) {
            // console.log('ERROR: Sender not found')
            throw new ExistenceError("Sending user not found")
        } 
        
        // console.log("Sender found:", sender.id, "verified:", sender.verified, "points:", sender.points)
        if (!sender.verified) {
            // console.log('ERROR: Sender not verified')
            throw new PermissionError("Sending user if not verified")
        }
        
        if (sender.points < amount) {
            // console.log('ERROR: Sender has insufficient points')
            throw new BadRequestError("Sending user does not have enough points to transfer")
        }

        // console.log('Finding recipient with id:', userId)
        const recipient = await prisma.user.findUnique({ where: { id: userId } })
        if (!recipient) {
            // console.log('ERROR: Recipient not found')
            throw new ExistenceError("Recipient user not found")
        }

        // console.log('Recipient found:', recipient.id, recipient.utorid)
        // console.log('Creating sender transaction')

        // create the sending transaction
        const senderTransaction = await prisma.transaction.create({
            data: {
                userId: sender.id,
                type: "transfer",
                sender: sender.utorid,
                recipient: recipient.utorid,
                sent: amount,
                relatedId: recipient.id,
                remark: hasRemark ? remark : null,
                createdBy: req.user.utorid
            }
        })

        // console.log('Sender transaction created:', senderTransaction.id)
        // console.log('Creating recipient transaction')

        // create the corresponding recipient transaction (don't need to store result)
        await prisma.transaction.create({
            data: {
                userId: recipient.id,
                type: "transfer",
                sender: sender.utorid,
                recipient: recipient.utorid,
                sent: amount,
                relatedId: sender.id,
                remark: hasRemark ? remark : null,
                createdBy: req.user.utorid
            }
        })

        // console.log('Recipient transaction created')
        // console.log('Updating sender points: decrement by', amount)

        // update the sender's points (decrease)
        await prisma.user.update({
            where: { id: sender.id },
            data: { points: { decrement: amount } }
        })

        // console.log('Sender points updated')
        // console.log('Updating recipient points: increment by', amount)
        
        // update the recipient's points (increase)
        await prisma.user.update({
            where: { id: recipient.id },
            data: { points: { increment: amount } }
        })

        // console.log('Recipient points updated')
        // console.log('Transfer completed successfully')
        // console.log('=== END DEBUG ===')

        return res.status(201).json({
            id: senderTransaction.id,
            sender: sender.utorid,
            recipient: recipient.utorid,
            type: "transfer",
            sent: amount,
            remark: senderTransaction.remark,
            createdBy: req.user.utorid
        })
    } catch (error) {
        // console.log('ERROR caught:', error.message)
        // console.log('Error type:', error.constructor.name)
        // console.log('=== END DEBUG (ERROR) ===')
        next(error)
    }
}

/**
 * POST /users/me/transactions
 * Creates a new redemption transaction.
 * 
 * - Case 89 (0/2)
 *     - REDEMPTION_OK
 *     - ?
 * - Case 90: REDEMPTION_EXCEED_BALANCE (1/1)
 */
async function createRedemptionTransaction(req, res, next) {
    try {
        let {
            type,
            amount,
            remark
        } = req.body

        const user = await prisma.user.findUnique({ where: { utorid: req.user.utorid } })
        if (!user) {
            throw new ExistenceError("Requesting user not found")
        }

        if (!user.verified) {
            throw new PermissionError("Requesting user is not verified")
        }

        validateTransactionType(type)
        if (type !== "redemption") {
            throw new BadRequestError("Type must be 'redemption' for redemption transactions")
        }

        amount = validateNumberField(amount, "Amount")

        if (user.points < amount) {
            throw new BadRequestError("Requested amount exceeds this user's point balance")
        }
        
        const hasRemark = remark != null && remark !== ""
        if (hasRemark) {
            validateStringField(remark, "Remark", false)
        }

        const transaction = await prisma.transaction.create({
            data: {
                userId: user.id,
                type: "redemption",
                redeemed: amount,
                remark: hasRemark ? remark : null,
                createdBy: req.user.utorid
            }
        })

        return res.status(201).json({
            id: transaction.id,
            utorid: user.utorid,
            type: "redemption",
            processedBy: null,
            amount: amount,
            remark: transaction.remark,
            createdBy: req.user.utorid
        })
    } catch (error) {
        next(error)
    }
}

/**
 * GET /users/me/transactions
 * Retrieves a list of transactions owned by the currently logged-in user.
 * 
 * - Case 98 (2/2)
 *     - GET_MY_TX_OK
 *     - ?
 */
async function getCurrentUserTransactions(req, res, next) {
    try {
        let {
            type,
            relatedId,
            promotionId,
            amount,
            operator,
            page = 1,
            limit = 10
        } = req.query

        page = validateNumberField(page, "Page")
        limit = validateNumberField(limit, "Limit")
        const skip = (page - 1) * limit

        const user = await prisma.user.findUnique({ where: { id: req.user.id } })
        if (!user) {
            throw new ExistenceError("User not found")
        }

        const where = {
            userId: user.id
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

        if (promotionId != null) {
            where.promotions = { some: { id: validateNumberField(promotionId, "Promotion ID") } }
        }

        if (amount != null) {
            if (!operator) {
                throw new BadRequestError("Amount must be used with the operator parameter")
            }

            const points = validateNumberField(amount, "Amount")
            validateStringField(operator, "Operator")
            if (operator === "gte") {
                where.amount = { gte: points }
            } else if (operator === "lte") {
                where.amount = { lte: points }
            } else {
                throw new BadRequestError("Operator must be 'gte'|'lte'")
            }
        }

        const count = await prisma.transaction.count({ where })

        const transactions = await prisma.transaction.findMany({
            where,
            include: {
                promotions: true
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit
        })

        const results = transactions.map(transaction => {
            const result = {
                id: transaction.id,
                type: transaction.type,
                promotionIds: transaction.promotions.map(p => p.id),
                remark: transaction.remark,
                createdBy: transaction.createdBy,
                // new fields for the data table on /my-transactions
                createdAt: transaction.createdAt,
                updatedAt: transaction.updatedAt
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
 * GET /users/me/transactions/:transactionId
 * Retrieves a list of transactions owned by the currently logged-in user.
 * 
 * - Case 98 (2/2)
 *     - GET_MY_TX_OK
 *     - ?
 */
async function getCurrentUserTransaction(req, res, next) {
    try {
        const transactionId = validateNumberField(req.params.transactionId, "Transaction ID")

        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { promotions: true }
        })

        if (!transaction) {
            throw new ExistenceError("Transaction not found")
        }

        // verify the transaction belongs to the current user
        if (transaction.userId !== req.user.id) {
            throw new ForbiddenError("You do not have permission to view this transaction")
        }

        const result = {
            id: transaction.id,
            type: transaction.type,
            promotionIds: transaction.promotions.map(p => p.id),
            remark: transaction.remark,
            createdBy: transaction.createdBy,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt
        }

        switch (transaction.type) {
            case "purchase":
                result.amount = transaction.amount
                result.spent = transaction.spent
                result.earned = transaction.earned
                break
            case "redemption":
                result.amount = -transaction.redeemed
                result.redeemed = transaction.redeemed
                result.processedBy = transaction.processedBy
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

        return res.status(200).json(result)
    } catch (error) {
        next(error)
    }
}

async function getUserByUtorid(req, res, next) {
    try {
        const { utorid } = req.params
        
        const user = await prisma.user.findUnique({
            where: { utorid }
        })
        
        if (!user) {
            throw new ExistenceError("User not found")
        }
        
        return res.status(200).json({
            id: user.id,
            utorid: user.utorid,
            name: user.name,
            email: user.email,
            role: user.role,
            verified: user.verified,
            points: user.points
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    updateCurrentUser,
    getCurrentUser,
    updateCurrentUserPassword,
    createTransferTransaction,
    createRedemptionTransaction,
    getCurrentUserTransactions,
    getCurrentUserTransaction,
    getUserByUtorid
}