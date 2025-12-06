const express = require("express")
const userRoutes = require("./users")
const authRoutes = require("./auth")
const transactionRoutes = require("./transactions")
const eventRoutes = require("./events")
const promotionRoutes = require("./promotions")

const router = express.Router()

router.use("/users", userRoutes)
router.use("/auth", authRoutes)
router.use("/transactions", transactionRoutes)
router.use("/events", eventRoutes)
router.use("/promotions", promotionRoutes)

module.exports = router
