const prisma = require("../utils/db")
const { validateStringField, validateNumberField, validateBoolenField } = require("../utils/validators")
const { validateName, validateTime, validatePromotionType } = require("../utils/domainValidators")
const { BadRequestError, ExistenceError, PermissionError } = require("../utils/errors")

/**
 * POST /promotions
 * Creates a new promotion
 * 
 * - Case 99: CREATE_PROMOTION_FORBIDDEN (1/1)
 * - Case 100: CREATE_PROMOTION_UNAUTHORIZED (1/1)
 * - Case 101 (6/6)
 *     - CREATE_PROMOTION_EMPTY_PAYLOAD
 *     - ?
 *     - ?
 *     - ?
 *     - ?
 *     - ?
 * - Case 102 (/2)
 *     - CREATE_PROMOTION_OK
 *     - ?
 */
/*
async function createPromotion(req, res, next) {
    try {
        let {
            name,
            description,
            type,
            startTime,
            endTime,
            minSpending,
            rate,
            points
        } = req.body

        validateName(name)
        validateStringField(description, "Description")
        validatePromotionType(type)
        startTime = validateTime(startTime, "Start time")
        endTime = validateTime(endTime, "End time")
        if (!(startTime < endTime)) {
            throw new BadRequestError("End time must be after start time")
        }

        // check if optional parameters were passed
        const hasMinSpending = minSpending != null
        const hasRate = rate != null
        const hasPoints = points != null

        if (!hasRate && !hasPoints) {
            throw new BadRequestError("At least one of rate or points must be provided")
        }

        // validate the optional body parameters
        if (hasMinSpending) minSpending = validateNumberField(minSpending, "Min spending", true, false)
        if (hasRate) rate = validateNumberField(rate, "Rate", true, false)
        if (hasPoints) points = validateNumberField(points, "Points")

        const select = {
            id: true,
            name: true,
            description: true,
            type: true,
            startTime: true,
            endTime: true,
            minSpending: true,
            rate: true,
            points: true
        }
        
        const promotion = await prisma.promotion.create({
            data: {
                name,
                description,
                type: type === "one-time" ? "onetime" : "automatic",
                startTime,
                endTime,
                minSpending: hasMinSpending ? minSpending : 0,
                rate: hasRate ? rate : 0,
                points: hasPoints ? points : 0
            },
            select
        })

        return res.status(201).json(promotion)
    } catch (error) {
        next(error)
    }
}
*/

async function createPromotion(req, res, next) {
    try {
        // console.log('=== CREATE PROMOTION DEBUG ===')
        // console.log('Request body:', JSON.stringify(req.body, null, 2))

        let {
            name,
            description,
            type,
            startTime,
            endTime,
            minSpending,
            rate,
            points
        } = req.body

        // console.log('Validating name:', name)
        validateName(name)
        
        // console.log('Validating description:', description)
        validateStringField(description, "Description")
        
        // console.log('Validating promotion type:', type)
        validatePromotionType(type)
        
        // console.log('Validating start time:', startTime)
        startTime = validateTime(startTime, "Start time")
        // console.log('Parsed start time:', startTime)
        
        // console.log('Validating end time:', endTime)
        endTime = validateTime(endTime, "End time")
        // console.log('Parsed end time:', endTime)
        
        if (!(startTime < endTime)) {
            // console.log('ERROR: End time must be after start time')
            throw new BadRequestError("End time must be after start time")
        }

        // check if optional parameters were passed
        const hasMinSpending = minSpending != null
        const hasRate = rate != null
        const hasPoints = points != null
        
        // console.log('Optional params - hasMinSpending:', hasMinSpending, 'hasRate:', hasRate, 'hasPoints:', hasPoints)

        if (!hasRate && !hasPoints) {
            // console.log('ERROR: Neither rate nor points provided')
            throw new BadRequestError("At least one of rate or points must be provided")
        }

        // validate the optional body parameters
        if (hasMinSpending) {
            // console.log('Validating minSpending:', minSpending)
            minSpending = validateNumberField(minSpending, "Min spending", true, false, true, true)
            // console.log('Validated minSpending:', minSpending)
        }
        if (hasRate) {
            // console.log('Validating rate:', rate)
            rate = validateNumberField(rate, "Rate", true, false, true, true)
            // console.log('Validated rate:', rate)
        }
        if (hasPoints) {
            // console.log('Validating points:', points)
            points = validateNumberField(points, "Points", true, true, true, true)
            // console.log('Validated points:', points)
        }

        const select = {
            id: true,
            name: true,
            description: true,
            type: true,
            startTime: true,
            endTime: true,
            minSpending: true,
            rate: true,
            points: true
        }
        
        const promotionData = {
            name,
            description,
            type: type === "one-time" ? "onetime" : "automatic",
            startTime,
            endTime,
            minSpending: hasMinSpending ? minSpending : 0,
            rate: hasRate ? rate : 0,
            points: hasPoints ? points : 0
        }
        
        // console.log('Creating promotion with data:', JSON.stringify(promotionData, null, 2))
        
        const promotion = await prisma.promotion.create({
            data: promotionData,
            select
        })

        // console.log('Promotion created successfully:', promotion.id)
        // console.log('=== END DEBUG ===')
        
        return res.status(201).json(promotion)
    } catch (error) {
        // console.log('ERROR caught:', error.message)
        // console.log('Error type:', error.constructor.name)
        // console.log('=== END DEBUG (ERROR) ===')
        next(error)
    }
}

/**
 * GET /promotions
 * Retrieves a list of promotions.
 * 
 * - Case 103 (2/2)
 *     - GET_PROMOTIONS_REGULAR_NEGATIVE_PAGE
 *     - ?
 * - Case 104: GET_PROMOTIONS_REGULAR_OK (1/1)
 * - Case 105: GET_PROMOTIONS_PRIVILEGED_BOTH_STARTED_ENDED (1/1)
 * - Case 106: GET_PROMOTIONS_PRIVILEGED_OK (/1)
 */
async function getPromotions(req, res, next) {
    try {
        let {
            name,
            type,
            started,
            ended,
            page = 1,
            limit = 10
        } = req.query;

        page = validateNumberField(page, "Page");
        limit = validateNumberField(limit, "Limit");
        const skip = (page - 1) * limit;

        const now = new Date();
        const where = {};

        // name filter
        if (name != null && name !== "") {
            validateName(name);
            where.name = { contains: name };
        }

        // type filter
        if (type != null && type !== "") {
            validatePromotionType(type);
            where.type = type === "one-time" ? "onetime" : "automatic";
        }

        const hasStarted = started != null && started !== "";
        const hasEnded = ended != null && ended !== "";

        if (hasStarted && hasEnded) {
            throw new BadRequestError("Cannot filter by both 'started' and 'ended'");
        }

        // started = true => already started  
        // started = false => not started yet
        if (hasStarted) {
            const startedBool = validateBoolenField(started, "Started");
            if (startedBool) {
                where.startTime = { lte: now };
            } else {
                where.startTime = { gt: now };
            }
        }

        // ended = true => already ended  
        // ended = false => still ongoing  
        if (hasEnded) {
            const endedBool = validateBoolenField(ended, "Ended");
            if (endedBool) {
                where.endTime = { lt: now };
            } else {
                where.endTime = { gte: now };
            }
        }

        const count = await prisma.promotion.count({ where });

        const promotions = await prisma.promotion.findMany({
            where,
            orderBy: { startTime: "desc" },
            skip,
            take: limit
        });

        const results = promotions.map(p => ({
            id: p.id,
            name: p.name,
            type: p.type,
            startTime: p.startTime,
            endTime: p.endTime,
            minSpending: p.minSpending,
            rate: p.rate,
            points: p.points
        }));

        return res.status(200).json({ count, results });

    } catch (error) {
        next(error);
    }
}

// async function getPromotions(req, res, next) {
//     try {
//         let {
//             name,
//             type,
//             started,
//             ended,
//             page = 1,
//             limit = 10
//         } = req.query

//         page = validateNumberField(page, "Page")
//         limit = validateNumberField(limit, "Limit")
//         const skip = (page - 1) * limit

//         const hasStarted = started != null && started !== ""
//         const hasEnded = ended != null && ended !== ""

//         if (hasStarted && hasEnded) {
//             throw new BadRequestError("Cannot filter by both 'started' and 'ended'")
//         }

//         const where = {}

//         if (name != null && name !== "") {
//             validateName(name)
//             where.name = { contains: name }
//         }

//         if (type != null && type !== "") {
//             validatePromotionType(type)
//             where.type = type === "one-time" ? "onetime" : "automatic"
//         }

//         const now = new Date()
//         if (req.user.role === "regular" || req.user.role === "cashier") {
            
//             const user = await prisma.user.findUnique({ where: { id: req.user.id } })
//             if (!user) {
//                 throw new ExistenceError("User not found")
//             }

//             const usedTransactions = await prisma.transaction.findMany({
//                 where: {
//                     userId: user.id,
//                     promotions: { some: {} }
//                 },
//                 select: {
//                     promotions: { select: { id: true } }
//                 }
//             })

//             const usedPromotionIds = usedTransactions.flatMap(t => t.promotions.map(p => p.id))

//             // sanwich time endpoints so regulars can only see active promotions
//             where.startTime = { lte: now }
//             where.endTime = { gte: now }

//             if (usedPromotionIds.length > 0) {
//                 where.id = { notIn: usedPromotionIds }
//             }
//         } else {
//             if (hasStarted) {
//                 const startedBool = validateBoolenField(started, "Started")
//                 if (startedBool) {
//                     where.startTime = { lte: now }
//                 } else {
//                     where.startTime = { gt: now }
//                 }
//             }

//             if (hasEnded) {
//                 const endedBool = validateBoolenField(ended, "Ended")
//                 if (endedBool) {
//                     where.endTime = { lt: now }
//                 } else {
//                     where.endTime = { gte: now }
//                 }
//             }
//         }

//         const count = await prisma.promotion.count({ where })

//         const promotions = await prisma.promotion.findMany({
//             where,
//             orderBy: { startTime: "desc" },
//             skip,
//             take: limit
//         })

//         const results = promotions.map(promotion => {
//             const result = {
//                 id: promotion.id,
//                 name: promotion.name,
//                 type: promotion.type,
//                 startTime: promotion.startTime,
//                 endTime: promotion.endTime,
//                 minSpending: promotion.minSpending,
//                 rate: promotion.rate,
//                 points: promotion.points
//             }

//             // add the startTime field
//             // if (req.user.role === "manager" || req.user.role === "superuser") {
//             //     result.startTime = promotion.startTime
//             // }

//             return result
//         })

//         return res.status(200).json({
//             count,
//             results
//         })

//     } catch (error) {
//         next(error)
//     }
// }

/**
 * GET /promotions/:promotionId
 * Retrieves a single promotion.
 * 
 * - Case 107: GET_PROMOTION_DETAILS_REGULAR_INACTIVE_404 (/1)
 * - Case 108: GET_PROMOTION_DETAILS_PRIVILEGED_OK (/1)
 * - Case 109: GET_PROMOTION_DETAILS_INVALID_ID_404 (1/1)
 * - Case 110: GET_PROMOTION_DETAILS_REGULAR_OK (/1)
 */
// async function getPromotionById(req, res, next) {
//     try {
//         const promotionId = validateNumberField(req.params.promotionId, "Promotion ID")
//         const promotion = await prisma.promotion.findUnique({ where: { id: promotionId } })

//         if (!promotion) {
//             throw new ExistenceError("Promotion not found")
//         }

//         const privileged = req.user.role === "manager" || req.user.role === "superuser"
//         // const privileged = req.user.role === "cashier" || req.user.role === "manager" || req.user.role === "superuser"

//         if (!privileged) {
//             const currentDate = new Date()
//             const startDate = new Date(promotion.startTime)
//             const endDate = new Date(promotion.endTime)
    
//             if (currentDate < startDate || endDate < currentDate) {
//                 throw new ExistenceError("Promotion not found")
//             }
//         }

//         return res.status(200).json({
//             id: promotion.id,
//             name: promotion.name,
//             description: promotion.description,
//             type: promotion.type,
//             ...(privileged && { startTime: promotion.startTime }),
//             endTime: promotion.endTime,
//             minSpending: promotion.minSpending,
//             rate: promotion.rate,
//             points: promotion.points
//         })
//     } catch (error) {
//         next(error)
//     }
// }

async function getPromotionById(req, res, next) {
    try {
        const promotionId = validateNumberField(req.params.promotionId, "Promotion ID")

        const promotion = await prisma.promotion.findUnique({
            where: { id: promotionId }
        })

        if (!promotion) {
            throw new ExistenceError("Promotion not found")
        }

        // remove all restrictions
        return res.status(200).json({
            id: promotion.id,
            name: promotion.name,
            description: promotion.description,
            type: promotion.type,
            startTime: promotion.startTime,
            endTime: promotion.endTime,
            minSpending: promotion.minSpending,
            rate: promotion.rate,
            points: promotion.points
        })
    } catch (error) {
        next(error)
    }
}


/**
 * PATCH /promotions/:promotionId
 * Updates an existing promotion.
 * 
 * - Case 111: UPDATE_PROMOTION_FORBIDDEN (1/1)
 * - Case 112: UPDATE_PROMOTION_PAST_START_TIME (1/1)
 * - Case 113 (3/3)
 *     - UPDATE_PROMOTION_PAST_START_TIME
 *     - ?
 *     - ?
 * - Case 114 (/2)
 *     - UPDATE_PROMOTION_OK
 *     - ?
 */
async function updatePromotion(req, res, next) {
    try {
        const promotionId = validateNumberField(req.params.promotionId, "Promotion ID")

        let {
            name,
            description,
            type,
            startTime,
            endTime,
            minSpending,
            rate,
            points
        } = req.body

        const hasName = name != null && name !== ""
        const hasDescription = description != null && description !== ""
        const hasType = type != null && type !== ""
        const hasStartTime = startTime != null && startTime !== ""
        const hasEndTime = endTime != null && endTime !== ""
        const hasMinSpending = minSpending != null
        const hasRate = rate != null
        const hasPoints = points != null

        if (
            !hasName &&
            !hasDescription &&
            !hasType &&
            !hasStartTime &&
            !hasEndTime &&
            !hasMinSpending &&
            !hasRate &&
            !hasPoints
        ) {
            throw new BadRequestError("At least one payload field must be present")
        }

        const promotion = await prisma.promotion.findUnique({ where: { id: promotionId } })
        if (!promotion) {
            throw new ExistenceError("Promotion not found")
        }

        const updateData = {}
        const now = new Date()
        const oldStartTime = new Date(promotion.startTime)
        const oldEndTime = new Date(promotion.endTime)

        if (hasName) {
            validateName(name)
            updateData.name = name
        }

        if (hasDescription) {
            validateStringField(description, "Description")
            updateData.description = description
        }

        if (hasType) {
            validatePromotionType(type)
            updateData.type = type === "one-time" ? "onetime" : "automatic"
        }

        if (hasStartTime) {
            startTime = validateTime(startTime, "Start time")
            updateData.startTime = startTime
        }

        if (hasEndTime) {
            endTime = validateTime(endTime, "End time")
            if (oldEndTime < now) {
                throw new BadRequestError("Cannot update end time after promotion has ended")
            }

            updateData.endTime = endTime
        }

        if (hasMinSpending) {
            minSpending = validateNumberField(minSpending, "Minimum spending", false)
            updateData.minSpending = minSpending
        } else {
            updateData.minSpending = 0
        }

        if (hasRate) {
            rate = validateNumberField(rate, "Rate", false, false)
            updateData.rate = rate
        }

        if (hasPoints) {
            points = validateNumberField(points, "Points")
            updateData.points = points
        }

        if (hasName || hasDescription || hasType || hasStartTime || hasMinSpending || hasRate || hasPoints) {
            if (oldStartTime < now) {
                throw new ValidationError("Cannot update after original start time has passed")
            }
        }

        if (hasStartTime || hasEndTime) {
            const newStart = hasStartTime ? startTime : oldStartTime
            const newEnd = hasEndTime ? endTime : oldEndTime
            if (newEnd <= newStart) {
                throw new ValidationError("End time must be after start time")
            }
        }

        const updatedPromotion = await prisma.promotion.update({
            where: { id: promotionId },
            data: updateData,
            select: {
                id: true,
                name: true,
                type: true,
                ...(hasDescription && { description: true }),
                ...(hasStartTime && { startTime: true }),
                ...(hasEndTime && { endTime: true }),
                // ...(hasMinSpending && { minSpending: true }),
                minSpending: true,
                ...(hasRate && { rate: true }),
                ...(hasPoints && { points: true })
            }
        })

        return res.status(200).json(updatedPromotion)
    } catch (error) {
        next(error)
    }
}

/**
 * DELETE /promotions/:promotionId
 * Removes a specific promotion.
 * 
 * - Case 116: DELETE_PROMOTION_STARTED_FORBIDDEN (0/1)
 * - Case 117: CREATE_PROMOTION_FOR_DELETE (1/1)
 * - Case 118: ? (1/1)
 */
async function deletePromotion(req, res, next) {
    try {
        const promotionId = validateNumberField(req.params.promotionId, "Promotion ID")

        const promotion = await prisma.promotion.findUnique({ where: { id: promotionId } })
        if (!promotion) {
            throw new ExistenceError("Promotion not found")
        }
        
        const currentDate = new Date()
        const startDate = new Date(promotion.startTime)
        if (startDate <= currentDate) {
            throw new PermissionError("Promotions that have started cannot be deleted")
        }

        // delete the event
        await prisma.promotion.delete({ where: { id: promotionId } })

        res.status(204).send()
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createPromotion,
    getPromotions,
    getPromotionById,
    updatePromotion,
    deletePromotion
}