const shouldDebug = require("../utils/debug")

function logSuccess(req, res, next) {
    if (!shouldDebug(req)) return next()

    const start = Date.now()

    res.on("finish", () => {
        const duration = Date.now() - start

        console.log(`✅ [SUCCESS] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`)

        if (res.locals.responseBody) {
            console.log(`[SUCCESS BODY]`, res.locals.responseBody)
        }
    })

    const originalJson = res.json
    res.json = function (body) {
        res.locals.responseBody = body
        return originalJson.call(this, body)
    }

    next()
}

module.exports = logSuccess