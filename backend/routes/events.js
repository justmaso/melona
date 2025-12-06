const express = require("express")
const authenticate = require("../middleware/authenticate")
const authorize = require("../middleware/authorize")
const eventController = require("../controllers/eventController")

const router = express.Router()
router.use(authenticate)

REGULAR = ["regular"]
MANAGER_OR_HIGHER = ["manager", "superuser"]

router.post("/", authorize(MANAGER_OR_HIGHER), eventController.createEvent)
router.get("/", eventController.getEvents)

router.get("/:eventId", eventController.getEventById)
router.patch("/:eventId", authorize(MANAGER_OR_HIGHER, true), eventController.updateEvent)
router.delete("/:eventId", authorize(MANAGER_OR_HIGHER), eventController.deleteEvent)

router.post("/:eventId/organizers", authorize(MANAGER_OR_HIGHER), eventController.addOrganizer)
router.delete("/:eventId/organizers/:userId", authorize(MANAGER_OR_HIGHER), eventController.removeOrganizer)

router.post("/:eventId/guests/me", authorize(REGULAR), eventController.addLoggedInUser)
router.delete("/:eventId/guests/me", authorize(REGULAR), eventController.removeLoggedInUser)
router.post("/:eventId/guests", authorize(MANAGER_OR_HIGHER, true), eventController.addGuest)
router.delete("/:eventId/guests/:userId", authorize(MANAGER_OR_HIGHER), eventController.removeGuest)

router.post("/:eventId/transactions", authorize(MANAGER_OR_HIGHER, true), eventController.createNewRewardTransaction)

module.exports = router
