const express = require("express")
const authenticate = require("../middleware/authenticate")
const authorize = require("../middleware/authorize")
const transactionController = require("../controllers/transactionController")

const router = express.Router()
router.use(authenticate)

const CASHIER_OR_HIGHER = ["cashier", "manager", "superuser"]
const MANAGER_OR_HIGHER = ["manager", "superuser"]

router.post("/", authorize(CASHIER_OR_HIGHER), transactionController.createTransaction)
router.get("/", authorize(MANAGER_OR_HIGHER), transactionController.getTransactions)
router.get("/:transactionId", authorize(MANAGER_OR_HIGHER), transactionController.getTransactionById)
router.patch("/:transactionId/suspicious", authorize(MANAGER_OR_HIGHER), transactionController.setSuspicious)
router.patch("/:transactionId/processed", authorize(CASHIER_OR_HIGHER), transactionController.processRedemptionTransaction)

module.exports = router
