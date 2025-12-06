const express = require("express")
const authenticate = require("../middleware/authenticate")
const authorize = require("../middleware/authorize")
const userController = require("../controllers/userController")

const router = express.Router()
router.use(authenticate)

router.post("/", authorize(["cashier", "manager", "superuser"]), userController.createUser)
router.get("/", authorize(["manager", "superuser"]), userController.getUsers)

router.patch("/me", userController.updateCurrentUser)
router.get("/me", userController.getCurrentUser)
router.patch("/me/password", userController.updateCurrentUserPassword)
router.post("/me/transactions", userController.createRedemptionTransaction)
router.get("/me/transactions", userController.getCurrentUserTransactions)
router.get("/me/transactions/:transactionId", userController.getCurrentUserTransaction)

// new endpoint for project
router.get("/utorid/:utorid", userController.getUserByUtorid)

router.get("/:userId", authorize(["cashier", "manager", "superuser"]), userController.getUserById)
router.patch("/:userId", authorize(["manager", "superuser"]), userController.updateUser)
router.post("/:userId/transactions", userController.createTransferTransaction)

module.exports = router