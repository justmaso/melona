const express = require("express")
const authController = require("../controllers/authController")

const router = express.Router()

router.post("/tokens", authController.login)
router.post("/resets", authController.requestPasswordReset)
router.post("/resets/:resetToken", authController.resetPasswordViaResetToken)
router.get("/resets/:resetToken", authController.verifyResetToken)

module.exports = router
