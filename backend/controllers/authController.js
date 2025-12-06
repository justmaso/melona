const prisma = require("../utils/db")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const { v4: uuidv4 } = require("uuid")
const { validateStringField } = require("../utils/validators")
const { validateUtorid, validatePassword } = require("../utils/domainValidators")

/**
 * POST /auth/tokens
 * Authenticates a user and generates a JWT token.
 */
async function login(req, res, next) {
    try {
        const { utorid, password } = req.body || {}

        validateUtorid(utorid)
        validatePassword(password)

        // attempt to find the user using these credentials
        const user = await prisma.user.findUnique({ where: { utorid } })

        // invalid credentials or doesn't have a password yet
        if (!user || !user.password) {
            const error = new Error()
            error.status = 401

            if (!user) error.message = `[Unauthorized] Invalid utorid: ${utorid}.`
            else error.message = `[Unauthorized] Password not set yet.`
            throw error
        }

        // check if passwords match
        const passwordValid = await bcrypt.compare(password, user.password)
        if (!passwordValid) {
            const error = new Error(`[Unauthorized] Invalid password for utorid: ${utorid}.`)
            error.status = 401
            throw error
        }

        const token = jwt.sign(
            // {
            //     id: user.id,
            //     utorid: user.utorid,
            //     name: user.name,
            //     email: user.email,
            //     role: user.role
            // },
            {
                id: user.id,
                utorid: user.utorid,
                name: user.name,
                email: user.email,
                role: user.role,
                points: user.points,
                verified: user.verified,
                suspicious: user.suspicious,
                birthday: user.birthday
            },
            process.env.JWT_SECRET || "dev-secret",
            { expiresIn: "7d" }
        )

        // based on postman results, we
        const expiresAt = new Date(Date.now() + (7 * 24 * 3600 * 1000))

        // update last login date
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        })

        return res.status(200).json({
            token,
            expiresAt
        })

    } catch (error) {
        next(error)
    }
}

/**
 * POST /auth/resets
 * Requests a password reset email.
 */
async function requestPasswordReset(req, res, next) {
    try {
        const { utorid } = req.body

        validateUtorid(utorid)

        // attempt to find the user via the passed email
        const user = await prisma.user.findUnique({ where: { utorid } })
        if (!user) {
            const error = new Error("User not found.")
            error.status = 404
            throw error
        }

        const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000)
        const resetToken = uuidv4()

        await prisma.user.update({
            where: { id: user.id },
            data: {
                expiresAt,
                resetToken
            }
        })

        return res.status(202).json({ expiresAt, resetToken })
    } catch (error) {
        next(error)
    }
}

/**
 * POST /auth/resets/:resetToken
 * Resets the password of a user given a reset token.
 */
async function resetPasswordViaResetToken(req, res, next) {
    try {
        const { resetToken } = req.params
        const { utorid, password } = req.body

        validateStringField(resetToken)
        validateUtorid(utorid)
        validatePassword(password)

        const userByResetToken = await prisma.user.findFirst({ where: { resetToken }})
        if (!userByResetToken) {
            const error = new Error("Reset token doesn't belong to any user.")
            error.status = 404
            throw error
        }

        // check if utorid matches
        if (userByResetToken.utorid !== utorid) {
            const error = new Error("Utorid does not match the reset token.")
            error.status = 401
            throw error
        }

        // check if the reset token has expired
        if (userByResetToken.expiresAt && userByResetToken.expiresAt < new Date()) {
            const error = new Error("Reset token has expired.")
            error.status = 410
            throw error
        }

        // (optional) hash the password
        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.update({
            where: { id: userByResetToken.id },
            data: {
                password: hashedPassword,
                expiresAt: null,
                resetToken: null
            }
        })

        return res.status(200).json({ message: "Password reset successfuly" })
    } catch (error) {
        next(error)
    }
}

async function verifyResetToken(req, res, next) {
    try {
        const { resetToken } = req.params

        validateStringField(resetToken)

        const user = await prisma.user.findFirst({ where: { resetToken } })
        
        if (!user) {
            const error = new Error("Invalid reset token")
            error.status = 404
            throw error
        }

        // check if the reset token has expired
        if (user.expiresAt && user.expiresAt < new Date()) {
            const error = new Error("Reset token has expired")
            error.status = 410
            throw error
        }

        return res.status(200).json({ utorid: user.utorid })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    login,
    requestPasswordReset,
    resetPasswordViaResetToken,
    verifyResetToken
}