const DEBUG = false

const DEBUG_ENDPOINTS = [
    { method: "PATCH", pathPrefix: "/events" }
]

function shouldDebug(req) {
    if (!DEBUG) return false

    const reqMethod = req.method.toUpperCase()
    const reqPath = req.originalUrl

    return DEBUG_ENDPOINTS.some(
        ({ method, pathPrefix }) =>
            reqMethod === method && reqPath.startsWith(pathPrefix)
    )
}

module.exports = shouldDebug
