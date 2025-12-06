const shouldDebug = require("../utils/debug")

function logEndpoint(req, res, next) {
    // if (!shouldDebug(req)) return next()

    const start = Date.now()
    console.log(`[DEBUG] ${req.method} ${req.originalUrl}`)
    console.log(`[DEBUG] Params:`, req.params)
    console.log(`[DEBUG] Query:`, req.query)
    console.log(`[DEBUG] Body:`, req.body)

    // hook into response to log after it's sent
    // res.on("finish", () => {
    //     const duration = Date.now() - start
    //     console.log(`[DEBUG] ✅ ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`)
    // })

    next()
}

module.exports = logEndpoint