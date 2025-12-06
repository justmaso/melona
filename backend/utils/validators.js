const { ValidationError } = require("./errors")

function requireField(value, fieldName) {
    if (value === undefined || value === null || value === "") {
        throw new ValidationError(`${fieldName} is required`)
    }
}

function validateStringField(value, fieldName, required = true) {
    if (required) requireField(value, fieldName)

    if (typeof value !== "string" || value.trim().length === 0) {
        throw new ValidationError(`${fieldName} must be a non-empty string`)
    }
}

function validateNumberField(value, fieldName, required = true, isInteger = true, mustBePositive = true, canBeZero = false) {
    if (required) requireField(value, fieldName)

    const num = Number(value)
    // if (isNaN(num)) {
    //     throw new ValidationError(`${fieldName} must be a valid number`)
    // } else if (isInteger && (!Number.isInteger(num) || num <= 0)) {
    //     throw new ValidationError(`${fieldName} must be a valid positive integer`)
    // } else if (!isInteger && num <= 0) {
    //     throw new ValidationError(`${fieldName} must be positive`)
    // }
    if (isNaN(num)) {
        throw new ValidationError(`${fieldName} must be a valid number`)
    } 
    
    if (isInteger && !Number.isInteger(num)) {
        throw new ValidationError(`${fieldName} must be an integer`)
    }

    if (mustBePositive && num <= 0) {
        if (!(canBeZero && num === 0)) {
            throw new ValidationError(`${fieldName} must be positive`)
        }
    }

    return num
}

function validateBoolenField(value, fieldName, required = true) {
    if (value === undefined) return undefined
    if (typeof value === "boolean") return value
    if (value === "true") return true
    if (value === "false") return false

    if (required) {
        throw new ValidationError(`${fieldName} must be true or false`)
    }

    return undefined
}

module.exports = {
    validateStringField,
    validateNumberField,
    validateBoolenField
}