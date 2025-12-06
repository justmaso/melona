const prisma = require("../utils/db")
const { validateStringField, validateNumberField, validateBoolenField } = require("../utils/validators")
const { validateName, validateTime, validateCapacity, validateUtorid, validateTransactionType } = require("../utils/domainValidators")
const { ValidationError, ExistenceError, GoneError, BadRequestError, PermissionError } = require("../utils/errors")

/**
 * `POST /events`
 * Creates a new point-earning event.
 * 
 * - Case 36 (1/1)
 * - Case 37 (1/1)
 * - Case 38 (6/6)
 * - Case 39 (5/5)
 */
async function createEvent(req, res, next) {
    try {
        const {
            name,
            description,
            location,
            startTime,
            endTime,
            capacity,
            points
        } = req.body

        validateName(name)
        validateStringField(description, "Description")
        validateStringField(location, "Location")
        const dateStartTime = validateTime(startTime, "Start time")
        const dateEndTime = validateTime(endTime, "End time")

        // check that the dates are sequential
        if (dateEndTime <= dateStartTime) {
            throw new ValidationError("End time must be after start time")
        }

        const parsedCapacity = validateCapacity(capacity)
        validateNumberField(points, "Points")


        const event = await prisma.event.create({
            data: {
                name,
                description,
                location,
                startTime,
                endTime,
                capacity: parsedCapacity,
                pointsRemain: points
            },
            select: {
                id: true,
                name: true,
                description: true,
                location: true,
                startTime: true,
                endTime: true,
                capacity: true,
                pointsRemain: true,
                pointsAwarded: true,
                published: true,
                organizers: { select: { id: true, utorid: true, name: true } },
                guests: { select: { id: true, utorid: true, name: true } }
            }
        })

        return res.status(201).json(event)
    } catch (error) {
        next(error)
    }
}

/**
 * GET /events
 * Retrieves a list of events.
 * 
 * - Case 45: GET_EVENTS_AS_SUPER_OK (/2)
 * - Case 48 (2/2)
 * - Case 49: GET_EVENTS_AS_REGULAR_OK (/2)
 * - Case 73 (2/2)
 */
async function getEvents(req, res, next) {
    try {
        const {
            name,
            location,
            started,
            ended,
            showFull,
            published
        } = req.query

        if (started !== undefined && ended !== undefined) throw new BadRequestError("Only specify one of started or ended")

        const page = req.query.page ? Number(req.query.page) : 1
        const limit = req.query.limit ? Number(req.query.limit) : 10

        if (req.query.page) validateNumberField(page, "Page")
        if (req.query.limit) validateNumberField(limit, "Limit")

        const startedFilter = started !== undefined
            ? validateBoolenField(started, "Started", false)
            : undefined

        const endedFilter = ended !== undefined
            ? validateBoolenField(ended, "Ended", false)
            : undefined
        
        const showFullFilter = showFull !== undefined
            ? validateBoolenField(showFull, "Show full", false)
            : undefined

        const publishedFilter = published !== undefined
            ? validateBoolenField(published, "Published", false)
            : undefined

        const filter = {}
        const currentDate = new Date()
        const managerOrHigher = req.user.role === "manager" || req.user.role === "superuser"

        // regular or cashier users can only see published events
        if (!managerOrHigher) {
            filter.published = true
        } else if (publishedFilter !== undefined) {
            filter.published = publishedFilter
        }

        // dynamically build the filter based on the query
        if (name) filter.name = { contains: name }
        if (location) filter.location = { contains: location }

        if (startedFilter !== undefined) {
            filter.startTime = startedFilter
                ? { lte: currentDate }
                : { gt: currentDate }
        }

        if (endedFilter !== undefined) {
            filter.endTime = endedFilter
                ? { lt: currentDate }
                : { gte: currentDate }
        }

        // get all the events
        const allEvents = await prisma.event.findMany({
            where: filter,
            // skip: (page - 1) * limit,
            // take: limit,
            orderBy: { id: "asc" },
            include: { guests: true }  // must include guests to filter capacity
        })

        let filteredEvents = allEvents
        if (showFullFilter === false) {
            filteredEvents = allEvents.filter(event => {
                return event.capacity === null || event.guests.length < event.capacity
            })
        }

        // get the total events after all filters are applied
        const count = filteredEvents.length

        const formattedEvents = filteredEvents
            .slice((page - 1) * limit, page * limit)
            .map(event => {
                const baseEvent = {
                    id: event.id,
                    name: event.name,
                    location: event.location,
                    startTime: event.startTime,
                    endTime: event.endTime,
                    capacity: event.capacity,
                    numGuests: event.guests.length
                }

                // add more attributes for managers or superusers
                if (managerOrHigher) {
                    return {
                        ...baseEvent,
                        pointsRemain: event.pointsRemain,
                        pointsAwarded: event.pointsAwarded,
                        published: event.published
                    }
                }

                return baseEvent
        })

        return res.status(200).json({ count, results: formattedEvents })
    } catch (error) {
        next(error)
    }
}

/**
 * GET /events/:eventId
 * Retrives a single event.
 * 
 * - Case 74 (2/2)
 *     - GET_EVENT_WRONG_ID (1/1)
 *     - ? (1/1)
 * - Case 75 (/2) MARKUS FAILURE
 *     - GET_EVENT_OKPUBLISHING (/1)
 *     - ? (/1)
 * - Case 76 (2/2)
 */
async function getEventById(req, res, next) {
    try {
        // console.log("===== [DEBUG] GET /events/:eventId =====")
        // console.log("[DEBUG] Raw req.params:", req.params)
        // console.log("[DEBUG] Raw req.user:", req.user)

        let { eventId } = req.params
        eventId = validateNumberField(eventId, "Event ID")
        // console.log("[DEBUG] Validated eventId:", eventId)

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                organizers: {
                    select: {
                        id: true,
                        utorid: true,
                        name: true
                    }
                },
                guests: {
                    select: {
                        id: true,
                        utorid: true,
                        name: true
                    }
                }
            }
        })

        // console.log("[DEBUG] Event found?", !!event)
        if (event) {
            // console.log("[DEBUG] Event data summary:", {
            //     id: event.id,
            //     name: event.name,
            //     published: event.published,
            //     organizers: event.organizers.map(o => o.id),
            //     guests: event.guests.length
            // })
        }
        if (!event) {
            // console.log("[DEBUG] No event found — throwing ExistenceError")
            throw new ExistenceError("Event not found")
        }
        
        const managerOrHigher = req.user.role === "manager" || req.user.role === "superuser"
        const organizer = event.organizers.some(o => o.id === req.user.id)
        // console.log("[DEBUG] Role checks:", {
        //     role: req.user.role,
        //     managerOrHigher,
        //     organizer,
        //     published: event.published
        // })

        // regular users can't see this event due to restrictions
        if (!managerOrHigher && !organizer && event.published === false) {
            // console.log("[DEBUG] User not allowed to see this event (unpublished) — throwing ExistenceError")
            throw new ExistenceError("Event not found")
        }

        // the response for regular, cashier, and not organizer users
        const baseEvent = {
            id: event.id,
            name: event.name,
            description: event.description,
            location: event.location,
            startTime: event.startTime,
            endTime: event.endTime,
            capacity: event.capacity,
            organizers: event.organizers,
            numGuests: event.guests.length
        }

        if (managerOrHigher || organizer) {
            // console.log("[DEBUG] Returning full event details for manager/organizer")
            return res.status(200).json({
                ...baseEvent,
                pointsRemain: event.pointsRemain,
                pointsAwarded: event.pointsAwarded,
                published: event.published,
                guests: event.guests
            })
        }
        
        // console.log("[DEBUG] Returning limited event details for regular user")
        return res.status(200).json(baseEvent)
    } catch (error) {
        // console.error("[DEBUG] Caught error in getEventById:", error)
        next(error)
    }
}

/**
 * PATCH /events/:eventId
 * Updates an existing event.
 * 
 * - Case 42: (2/2)
 *     - UPDATE_EVENT_POINTS_FORBIDDEN
 * - Case 43: (3/3)
 *     - UPDATE_EVENT_POINTS_NEGATIVE
 * - Case 44: (2/2)
 *     - UPDATE_EVENT_POINTS_OK
 * - Case 46: PUBLISH_ALL_EVENTS_OK (1/1)
 * - Case 54: (3/3)
 *     - UPDATE_NAME_AFTER_ENDED
 * - Case 58: UPDATE_EVENT_OK (1/1)
 * - Case 66: UPDATE_EVENT_CAPACITY_TO_3 (1/1)
 * - Case 71: UPDATE_EVENT_POINTS_NOT_ENOUGH (/1)
 * - Case 72: UPDATE_EVENT_POINTS_OK (1/1)
 */
async function updateEvent(req, res, next) {
    try {
        const eventId = validateNumberField(req.params.eventId, "Event ID")

        let {
            name,
            description,
            location,
            startTime,
            endTime,
            capacity,
            points,
            published
        } = req.body || {}

        // get the corresponding event
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { guests: true }
        })
        if (!event) {
            throw new ExistenceError("Event not found")
        }

        const hasName = name != null && name !== ""
        const hasDescription = description != null && description !== ""
        const hasLocation = location != null && location !== ""
        const hasStartTime = startTime != null && startTime !== ""
        const hasEndTime = endTime != null && endTime !== ""
        const hasCapacity = capacity != null
        const hasPoints = points != null
        const hasPublished = published != null

        if (
            !hasName &&
            !hasDescription &&
            !hasLocation &&
            !hasStartTime &&
            !hasEndTime &&
            !hasCapacity &&
            !hasPoints &&
            !hasPublished
        ) {
            throw new BadRequestError("At least one payload field must be present")
        }

        const updateData = {}

        if (hasName) {
            validateName(name)
            updateData.name = name
        }

        if (hasDescription) {
            validateStringField(description, "Description")
            updateData.description = description
        }

        if (hasLocation) {
            validateStringField(location, "Location")
            updateData.location = location
        }


        const currentDate = new Date()
        if (hasStartTime) {
            startTime = validateTime(startTime, "Start time")
            if (startTime < currentDate) {
                throw new BadRequestError("Start time must be in the future")
            }

            updateData.startTime = startTime
        }

        if (hasEndTime) {
            endTime = validateTime(endTime, "End time")
            const originalEndTime = new Date(event.endTime)
            if (endTime < currentDate) {
                throw new BadRequestError("End time must be in the future")
            } else if (originalEndTime < currentDate) {
                throw new ValidationError("Can't update end time after original end time has passed")
            }

            updateData.endTime = endTime
        }

        if (hasCapacity) {
            capacity = validateNumberField(capacity, "Capacity")
            if (capacity < event.capacity && capacity < event.guests.length) {
                throw new ValidationError("New capacity exceeds the confirmed number of guests")
            }

            updateData.capacity = capacity
        }

        // validate against original start date
        if (hasName || hasDescription || hasLocation || hasStartTime || hasCapacity) {
            const originalStartDate = new Date(event.startTime)
            if (originalStartDate < currentDate) {
                throw new ValidationError("Cannot update after original start time has passed")
            }
        }

        if (hasPoints) {
            points = validateNumberField(points, "Points")

            const currentPointsAwarded = event.pointsAwarded
            const newPointsRemaining = points - currentPointsAwarded

            if (req.user.role !== "manager") {
                throw new PermissionError("Only managers can update points")
            } else if (newPointsRemaining < 0) {
                throw new BadRequestError("Cannot reduce total points below what has already been awarded")
            }

            updateData.pointsRemain = newPointsRemaining
        }

        if (hasPublished) {
            published = validateBoolenField(published, "Published")

            if (req.user.role !== "manager") {
                throw new PermissionError("Only managers can update the published status")
            } else if (!published) {
                throw new BadRequestError("Published must be set to true if passed")
            }

            updateData.published = published
        }

        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data: updateData,
            select: {
                id: true,
                name: true,
                location: true,
                ...(hasDescription && { description: true }),
                ...(hasStartTime && { startTime: true }),
                ...(hasEndTime && { endTime: true }),
                ...(hasCapacity && { capacity: true }),
                ...(hasPoints && { pointsRemain: true }),
                ...(hasPublished && { published: true })
            }
        })

        return res.status(200).json(updatedEvent)
    } catch (error) {
        next(error)
    }
}

/**
 * DELETE /events/:eventId
 * Removes a speific event.
 * 
 * - Case 57: DELETE_EVENT_PUBLISHED (/1) MARKUS FAILURE?
 * - Case 59: DELETE_EVENT_OK (1/1)
 */
async function deleteEvent(req, res, next) {
    try {
        let { eventId } = req.params
        eventId = validateNumberField(eventId, "Event ID")

        const event = await prisma.event.findUnique({ where: { id: eventId } })
        
        if (!event) {
            throw new ExistenceError("Event not found")
        } else if (event.published) {
            throw new BadRequestError("Cannot delete published events")
        }

        await prisma.event.delete({ where: { id: eventId } })

        return res.status(204).send()
    } catch (error) {
        next(error)
    }
}

/**
 * POST /events/:eventId/organizers
 * Adds an organizer to a specific event.
 * 
 * - Case 40: ? (2/2)
 * - Case 41: ADD_ORGANIZER_OK (2/2)
 * - Case 51: ADD_ORGANIZER_ALREADY_GUEST (1/1)
 * - Case 55: ADD_ORGANIZER_GONE (1/1)
 */
async function addOrganizer(req, res, next) {
    try {
        let { eventId } = req.params
        const { utorid } = req.body

        eventId = validateNumberField(eventId, "Event ID", false)
        validateUtorid(utorid)

        // check if the event ID exists
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { organizers: true, guests: true }
        })
        if (!event) throw new ExistenceError("Event not found")

        // check if the event has ended
        if (new Date(event.endTime) < new Date()) throw new GoneError("Cannot add organizer to past events")

        // check if the user exists
        const user = await prisma.user.findUnique({ where: { utorid } })
        if (!user) throw new ExistenceError("User not found")

        if (event.guests.some(g => g.id === user.id)) throw new BadRequestError("User is registered as a guest. Remove them first and try again")
        if (event.organizers.some(o => o.id === user.id)) throw new BadRequestError("User is already an organizer")

        // add the user as an organizer to this event
        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data: {
                organizers: {
                    connect: { id: user.id }
                }
            },
            select: {
                id: true,
                name: true,
                location: true,
                organizers: {
                    select: {
                        id: true,
                        utorid: true,
                        name: true
                    }
                }
            }
        })

        return res.status(201).json(updatedEvent)
    } catch (error) {
        next(error)
    }
}

/**
 * DELETE /events/:eventId/organizers/:userId
 * Removes an organizer from a specific event.
 * 
 * - Case 52: REMOVE_ORGANIZER_FORBIDDEN (1/1)
 * - Case 53: REMOVE_ORGANIZER_OK (1/1)
 */
async function removeOrganizer(req, res, next) {
    try {
        let { eventId, userId } = req.params
    
        eventId = validateNumberField(eventId, "Event ID")
        userId = validateNumberField(userId, "User ID")

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { organizers: true }
        })
        if (!event) throw new ExistenceError("Event not found")

        // check if the event already happened
        if (new Date(event.endTime) < new Date()) throw new GoneError("Cannot remove organizer from past events")

        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) throw new ExistenceError("User not found")

        if (!event.organizers.some(o => o.id === user.id)) throw new BadRequestError("User is not an organizer for this event")

        await prisma.event.update({
            where: { id: eventId },
            data: {
                organizers: {
                    disconnect: { id: user.id }
                }
            }
        })

        res.status(204).json({ message: "Successfully removed user as organizer from event" })
    } catch (error) {
        next(error)
    }
}

/**
 * POST /events/:eventId/guests
 * Adds a guest to a specific event.
 * 
 * - Case 47: REGISTER_GUEST_ORGANIZER (1/1)
 * - Case 50: REGISTER_GUEST_OK (1/1)
 * - Case 56: REGISTER_GUEST_GONE (1/1)
 * - Case 64: GUEST_OTHERS_TO_EVENT (1/1)
 * - Case 65: GUEST_OTHERS_TO_FULL_EVENT (1/1)
 */
async function addGuest(req, res, next) {
    try {
        let { eventId } = req.params
        const { utorid } = req.body

        eventId = validateNumberField(eventId, "Event ID")
        validateUtorid(utorid)

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { organizers: true, guests: true }
        })

        // validate the event
        if (!event) throw new ExistenceError("Event not found")
        if (new Date(event.endTime) < new Date()) throw new GoneError("Cannot add guest to past events")
        if (event.capacity !== null && event.guests.length >= event.capacity) throw new GoneError("Event is full")
        
        const user = await prisma.user.findUnique({ where: { utorid } })
        
        // validate the user
        if (!user) throw new ExistenceError("User not found")
        if (event.organizers.some(o => o.id === user.id)) throw new BadRequestError("User is an organizer. Remove them first and try again")
        if (event.guests.some(g => g.id === user.id)) throw new BadRequestError("User is already a guest")
        
        // make the user a guest for this event
        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data: {
                guests: { connect: { id: user.id } }
            },
            select: {
                id: true,
                name: true,
                location: true,
                guests: {
                    select: {
                        id: true,
                        utorid: true,
                        name: true
                    }
                }
            }
        })

        const guestAdded = updatedEvent.guests.find(g => g.id === user.id)
        const numGuests = updatedEvent.guests.length

        return res.status(201).json({
            id: updatedEvent.id,
            name: updatedEvent.name,
            location: updatedEvent.location,
            guestAdded,
            numGuests
        })
    } catch (error) {
        next(error)
    }
}

/**
 * DELETE /events/:eventId/guests/:userId
 * Removes a guest from a specific event.
 * 
 * NO TESTS
 */
async function removeGuest(req, res, next) {
    try {
        let { eventId, userId } = req.params

        // validate event and user IDs
        eventId = validateNumberField(eventId, "Event ID")
        userId = validateNumberField(userId, "User ID")

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { guests: true }
        })
        if (!event) throw new ExistenceError("Event not found")

        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) throw new ExistenceError("User not found")
        
        if (!event.guests.some(g => g.id === user.id)) throw new BadRequestError("User is not a guest of this event")
        
        // remove the user from guests
        await prisma.event.update({
            where: { id: eventId },
            data: { guests: { disconnect: { id: user.id } } }
        })

        return res.status(204).json({ message: "Guest removed successfully" })
    } catch (error) {
        next(error)
    }
}

/**
 * POST /events/:eventId/guests/me
 * Adds a logged-in user user to a specific event.
 * 
 * - Case 60: GUEST_MYSELF_TO_PAST_EVENT (1/1)
 * - Case 61: (2/2)
 *     - GUEST_MYSELF_TO_FUTURE_EVENT (1/2)
 *     - GET_EVENT_POST_REGISTER (1/1)
 */
async function addLoggedInUser(req, res, next) {
    try {
        let { eventId } = req.params
        eventId = validateNumberField(eventId, "Event ID")

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { guests: true }
        })

        if (!event) throw new ExistenceError("Event not found")
        if (new Date(event.endTime) < new Date()) throw new GoneError("Cannot add self to ended events")
        if (event.guests.some(g => g.id === req.user.id)) throw new BadRequestError("User is already a guest")
        if (event.capacity !== null && event.guests.length >= event.capacity) throw new GoneError("Event is full")

        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data: {
                guests: { connect: { id: req.user.id } }
            },
            select: {
                id: true,
                name: true,
                location: true,
                guests: {
                    select: {
                        id: true,
                        utorid: true,
                        name: true
                    }
                }
            }
        })

        const guestAdded = updatedEvent.guests.find(g => g.id === req.user.id)
        const numGuests = updatedEvent.guests.length

        return res.status(201).json({
            id: updatedEvent.id,
            name: updatedEvent.name,
            location: updatedEvent.location,
            guestAdded,
            numGuests
        })
    } catch (error) {
        next(error)
    }
}

/**
 * DELETE /events/:eventId/guests/me
 * Removes the logged-in user from a specific event.
 * 
 * - Case 62: UNREGISTER_GUEST_GONE (1/1)
 * - Case 63: UNREGISTER_GUEST_OK (1/1)
 */
async function removeLoggedInUser(req, res, next) {
    try {
        let { eventId } = req.params
        eventId = validateNumberField(eventId, "Event ID")

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { guests: true }
        })
        if (!event) throw new ExistenceError("Event not found")
        if (new Date(event.endTime) < new Date()) throw new GoneError("Can't reverse RSVP since the event is over")
        if (!event.guests.some(g => g.id === req.user.id)) throw new BadRequestError("User did not RSVP to this event")

        // remove the user from guests
        await prisma.event.update({
            where: { id: eventId },
            data: { guests: { disconnect: { id: req.user.id } } }
        })

        return res.status(204).send()
    } catch (error) {
        next(error)
    }
}

/**
 * POST /events/:eventId/transactions
 * Creates a new reward transaction (i.e., awards points).
 * 
 * - Case 67: (1/1)
 * - Case 68 (3/3)
 *     - AWARD_POINTS_NOT_A_GUEST
 *     - ?
 *     - ?
 * - Case 69 (2/2)
 *     - AWARD_POINTS_OK
 *     - ?
 * - Case 70 (2/2)
 *     - AWARD_POINTS_NO_UTORID_OK
 *     - ?
 */
async function createNewRewardTransaction(req, res, next) {
    try {
        const eventId = validateNumberField(req.params.eventId, "Event ID")

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { guests: true }
        })
        if (!event) {
            throw new ExistenceError("Event not found")
        }

        let {
            type,
            utorid,
            amount,
            remark
        } = req.body

        validateTransactionType(type)
        if (type !== "event") {
            throw new BadRequestError("Type must be 'event'")
        }

        amount = validateNumberField(amount, "Amount")

        const createdBy = req.user.utorid
        const hasUtorid = utorid != null && utorid !== ""
        const hasRemark = remark != null && remark !== ""
        if (hasRemark) {
            validateStringField(remark, "Remark")
        }

        if (hasUtorid) {
            validateUtorid(utorid)
            const user = await prisma.user.findUnique({ where: { utorid} })
            if (!user) {
                throw new ExistenceError("User not found")
            }

            const isGuest = event.guests.some(guest => guest.utorid === utorid)
            if (!isGuest) {
                throw new BadRequestError("User is not a guest of this event")
            }

            if (event.pointsRemain < amount) {
                throw new BadRequestError("Remaining points is less than the amount to reward")
            }

            // create the transaction
            const transaction = await prisma.transaction.create({
                data: {
                    userId: user.id,
                    type: "event",
                    amount: amount,
                    relatedId: eventId,
                    createdBy,
                    remark: hasRemark ? remark : null
                }
            })

            // award this one user points
            await prisma.user.update({
                where: { id: user.id },
                data: { points: { increment: amount } }
            })

            // update the event's points
            await prisma.event.update({
                where: { id: eventId },
                data: {
                    pointsRemain: { decrement: amount },
                    pointsAwarded: { increment: amount }
                }
            })

            return res.status(200).json({
                id: transaction.id,
                recipient: user.utorid,
                awarded: amount,
                type,
                relatedId: eventId,
                remark: transaction.remark,
                createdBy
            })
        } else {
            if (event.guests.length === 0) {
                throw new BadRequestError("Event has no guests to award points to")
            }

            const totalAmount = amount * event.guests.length

            if (event.pointsRemain < totalAmount) {
                throw new BadRequestError("Remaining points is less than the requested amount")
            }

            const transactions = await Promise.all(
                event.guests.map(async (guest) => {
                    const transaction = await prisma.transaction.create({
                        data: {
                            userId: guest.id,
                            type,
                            // awarded: amount,
                            amount: amount,
                            relatedId: eventId,
                            createdBy,
                            remark: hasRemark ? remark : null
                        }
                    })

                    await prisma.user.update({
                        where: { id: guest.id },
                        data: { points: { increment: amount } }
                    })

                    return {
                        id: transaction.id,
                        recipient: guest.utorid,
                        awarded: amount,
                        type,
                        relatedId: eventId,
                        remark: transaction.remark,
                        createdBy
                    }
                })
            )

            // after creating all transactions, update the event points
            await prisma.event.update({
                where: { id: eventId },
                data: {
                    pointsAwarded: { increment: totalAmount },
                    pointsRemain: { decrement: totalAmount }
                }
            })

            return res.status(200).json(transactions)
        }
    } catch (error) {
        // console.error("Error in createNewRewardTransaction:", error)
        next(error)
    }
}

module.exports = {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    addOrganizer,
    removeOrganizer,
    addGuest,
    removeGuest,
    addLoggedInUser,
    removeLoggedInUser,
    createNewRewardTransaction
}