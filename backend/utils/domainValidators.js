const { ValidationError } = require("./errors")
const { validateStringField, validateNumberField } = require("./validators")

function validateUtorid(utorid) {
    validateStringField(utorid, "Utorid")

    const regexPattern = /^[a-zA-z0-9]{7,8}$/
    if (!regexPattern.test(utorid)) {
        throw new ValidationError("Utorid must be alphanumeric and 7-8 characters long")
    }
}

function validateName(name) {
    validateStringField(name, "Name")

    if (name.length < 1 || name.length > 50) {
        throw new ValidationError("Name must be between 1-50 characters (inclusive)")
    }
}

function validateUofTEmail(email) {
    validateStringField(email, "Email")

    const regexPattern = /^[^\s@]+@mail\.utoronto\.ca$/i
    if (!regexPattern.test(email)) {
        throw new ValidationError("Email must be a valid UofT email address (i.e., @mail.utoronto.ca)")
    }
}

function validatePassword(password, fieldName = "Password") {
    validateStringField(password, fieldName)

    const regexPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()[\]{}\-_+=~`|:;"'<>,.?/\\]).{8,20}$/
    if (!regexPattern.test(password)) {
        throw new ValidationError(`${fieldName} must be 8-20 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character`)
    }
}

function validateUserId(userId) {
    return validateNumberField(userId, "User ID")
}

function validateBirthday(birthday) {
    // check if format is correct
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
        throw new ValidationError("Birthday must be in the format YYYY-MM-DD")
    }

    // check if it's an actual date
    const date = new Date(birthday)
    if (isNaN(date.getTime()) || date.toISOString().split("T")[0] !== birthday) {
        throw new ValidationError("Birthday must be a valid date")
    }
}

function validateTime(time, fieldName = "Time") {
    validateStringField(time, fieldName)

    // check if it's an actual date
    const date = new Date(time)

    if (isNaN(date.getTime())) {
        throw new ValidationError(`${fieldName} must be a valid date`)
    }

    // check for ISO 8601
    try {
        date.toISOString()
    } catch {
        throw new ValidationError(`${fieldName} must be a valid ISO 8601 date`)
    }
    
    // check if date is in the past
    if (date < new Date()) {
        throw new ValidationError(`${fieldName} cannot be in the past`)
    }

    return date
}

function validateCapacity(capacity) {
    // capacity can be null (i.e., no limit)
    if (capacity == null) return null

    // check if capacity is a number
    if (typeof capacity !== "number") {
        throw new ValidationError("Capacity must be a positive integer or null")
    }

    // check that capacity is in range
    if (!Number.isInteger(capacity) || capacity <= 0) {
        throw new ValidationError("Capacity must be a positive integer (if passed)")
    }

    return capacity
}

function validateTransactionType(transaction) {
    validateStringField(transaction, "Transaction type")

    const TRANSACTION_TYPES = ["purchase", "adjustment", "event", "redemption", "transfer"]
    if (!TRANSACTION_TYPES.includes(transaction)) {
        throw new ValidationError(`Type must be from [${TRANSACTION_TYPES.join(", ")}]`)
    }
}

function validatePromotionType(promotion) {
    validateStringField(promotion, "Promotion type")

    // const PROMOTION_TYPES = ["automatic", "onetime"]
    const PROMOTION_TYPES = ["automatic", "one-time"]
    if (!PROMOTION_TYPES.includes(promotion)) {
        throw new ValidationError(`Type must be from [${PROMOTION_TYPES.join(", ")}]`)
    }
}

module.exports = {
    validateUtorid,
    validateName,
    validateUofTEmail,
    validatePassword,
    validateUserId,
    validateBirthday,
    validateTime,
    validateCapacity,
    validateTransactionType,
    validatePromotionType
}