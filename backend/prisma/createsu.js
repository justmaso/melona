/*
 * Complete this script so that it is able to add a superuser to the database
 * Usage example: 
 *   node prisma/createsu.js clive123 clive.su@mail.utoronto.ca SuperUser123!
 */
"use strict"

const prisma = require("../utils/db")
const bcrypt = require("bcrypt")

async function createSuperuser() {
    // get command line args for the SU
    const [
        utorid,
        email,
        password
    ] = process.argv.slice(2)

    // check if SU fields are missing
    if (!utorid || !email || !password) {
        console.error("Usage: node prisma/createsu.js <utorid> <email> <password>")
        process.exit(1)
    }

    // attempt to seed the SU
    try {
        // check if any user already uses the passed utorid
        const existingUser = await prisma.user.findUnique({ where: { utorid } })
        if (existingUser) {
            console.error(`[error] A user with utorid '${utorid}' already exists`)
            process.exit(1)
        }

        // (optional) hash the password
        const hashedPassword = await bcrypt.hash(password, 10)

        // no existing SU
        const superuser = await prisma.user.create({
            data: {
                utorid,
                name: utorid,
                email,
                password: hashedPassword,
                role: "superuser",
                verified: true
            }
        })

        console.log(`[success] Superuser created: ${superuser.utorid} ${superuser.email}`)
    } catch (error) {
        console.error("[error] Failed to create superuser:", error)
        process.exit(1)
    }
}

// create the SU when this file is run via node
createSuperuser().finally(() => prisma.$disconnect)