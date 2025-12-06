class AppError extends Error {
    constructor(message, status) {
        super(message)
        this.name = new.target.name
        this.status = status || 500
        Error.captureStackTrace(this, this.constructor)
    }
}

// 4xx - client errors
class BadRequestError extends AppError {
    constructor(message = "Bad request") {
        super(message, 400)
    }
}

class ValidationError extends AppError {
    constructor(message = "Validation failed") {
        super(message, 400)
    }
}

class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized") {
        super(message, 401)
    }
}

class PermissionError extends AppError {
    constructor(message = "Forbidden") {
        super(message, 403)
    }
}

class ExistenceError extends AppError {
    constructor(message = "Not found") {
        super(message, 404)
    }
}

class ConflictError extends AppError {
    constructor(message = "Conflict") {
        super(message, 409)
    }
}

class GoneError extends AppError {
    constructor(message = "Resource no longer available") {
        super(message, 410)
    }
}

module.exports = {
    AppError,
    BadRequestError,
    ValidationError,
    UnauthorizedError,
    PermissionError,
    ExistenceError,
    ConflictError,
    GoneError
}
