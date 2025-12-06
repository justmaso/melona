const shouldDebug = require("../utils/debug")

function logRequestResponse(req, res, next) {
    if (!shouldDebug(req)) return next()

    const start = Date.now()

    // log the incoming request
    console.log("─────────────────────────────")
    console.log(`[REQUEST] ${req.method} ${req.originalUrl}`)
    console.log("Params:  ", JSON.stringify(req.params, null, 2))
    console.log("Query:   ", JSON.stringify(req.query, null, 2))
    console.log("Body:    ", JSON.stringify(req.body, null, 2))
    console.log("User:    ", JSON.stringify(req.user || {}, null, 2))
    console.log("─────────────────────────────")

    // capture response body by wrapping res.json
    const oldJson = req.json
    res.json = function (body) {
        res.locals.responseBody = body
        return oldJson.call(this, body)
    }

    // after response finishes
    res.on("finish", () => {
        const duration = Date.now() - start
        const status = res.statusCode
        const type = status >= 400 ? "ERROR" : "SUCCESS"

        console.log("─────────────────────────────")
        console.log(`[${type}] ${req.method} ${req.originalUrl} - ${status} (${duration}ms)`)
        console.log("Response body:", JSON.stringify(res.locals.responseBody, null, 2))
        console.log("─────────────────────────────\n")
    })

    next()
}

module.exports = logRequestResponse
