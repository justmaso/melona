const jwt = require("jsonwebtoken")

function authenticate(req, _res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        const error = new Error("Invalid token: token is required")
        error.status = 401
        next(error)
    }

    // get the token after the space in: Bearer [token]
    const authToken = authHeader.split(" ")[1]

    try {
        const decodedUser = jwt.verify(authToken, process.env.JWT_SECRET || "dev-secret")
        req.user = decodedUser
        next()
    } catch (_error) {
        const error = new Error("Invalid or expired token.")
        error.status = 401
        next(error)
    }
}

module.exports = authenticate
