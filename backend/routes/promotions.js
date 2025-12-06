const express = require("express")
const authenticate = require("../middleware/authenticate")
const authorize = require("../middleware/authorize")
const promotionController = require("../controllers/promotionController")

const router = express.Router()
router.use(authenticate)

REGULAR_OR_HIGHER = ["regular", "cashier", "manager", "superuser"]
MANAGER_OR_HIGHER = ["manager", "superuser"]

router.post("/", authorize(MANAGER_OR_HIGHER), promotionController.createPromotion)
// router.get("/", authorize(REGULAR_OR_HIGHER), promotionController.getPromotions)
// router.get("/:promotionId", authorize(REGULAR_OR_HIGHER), promotionController.getPromotionById)
router.get("/", promotionController.getPromotions)
router.get("/:promotionId", promotionController.getPromotionById)
router.patch("/:promotionId", authorize(MANAGER_OR_HIGHER), promotionController.updatePromotion)
router.delete("/:promotionId", authorize(MANAGER_OR_HIGHER), promotionController.deletePromotion)

module.exports = router
