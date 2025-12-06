const prisma = require("../utils/db")
const { ExistenceError, PermissionError } = require("../utils/errors")
const shouldDebug = require("../utils/debug")

function authorize(allowedRoles = [], allowEventOrganizer = false) {
    return async (req, _res, next) => {
        try {
            const { role, id: userId } = req.user

            // allow authorized roles immediately
            if (allowedRoles.includes(role)) {
                if (shouldDebug(req)) {
                    console.log(`Allowing ${req.user.name} (${req.user.role}) to proceed`)
                }
                return next()
            }

            // check if the user is an organizer of some event
            if (allowEventOrganizer && req.params.eventId) {
                const eventId = Number(req.params.eventId)
                const event = await prisma.event.findUnique({
                    where: { id: eventId },
                    include: { organizers: true }
                })

                // no corresponding event
                if (!event) throw new ExistenceError("Event not found")

                // allow event organizers to continue
                if (event.organizers.some(o => o.id === userId)) {
                    if (shouldDebug(req)) {
                        console.log(`Allowing organizer ${req.user.name} (${req.user.role}) to proceed`)
                    }
                    return next()
                }
            }

            // default no permission granted
            next(new PermissionError("Insufficient permission to perform this action"))
        } catch (error) {
            next(error)
        }
        
    }
}

module.exports = authorize
