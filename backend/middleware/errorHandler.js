const shouldDebug = require("../utils/debug")

/**
 * Global error-handling middlware.
 */
function errorHandler(error, req, res, _next) {
    const status = error.status || 500
    const message = error.message || "Internal server error"

    if (shouldDebug(req)) {
        console.error("----- [DEBUG ERROR TRACE] -----")
        console.error(`[${req.method}] ${req.originalUrl}`)
        console.error(`Status: ${status}`)
        console.error(`Message: ${message}`)
        console.error("Stack:", error.stack.split("\n").slice(0, 3).join("\n")) // short trace
        console.error("-------------------------------")
    }
    return res.status(status).json({ error: message })
}

module.exports = errorHandler
