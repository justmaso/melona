/*
 * If you need to initialize your database with some data, you may write a script
 * to do so here.
 */
"use strict"
const prisma = require("../utils/db")
const bcrypt = require("bcrypt")

async function hashPassword(password) {
    const hashedPassword = await bcrypt.hash(password, 10)
    return hashedPassword
}

async function seed() {
    console.log("starting seed process...")
    await prisma.user.deleteMany()
    await prisma.event.deleteMany()
    await prisma.promotion.deleteMany()
    await prisma.transaction.deleteMany()
    console.log("existing data cleared.")

    // create the SU @lawmelon
    await prisma.user.create({
        data: {
            utorid: "lawmelon",
            name: "Maso",
            email: "lawmelon@mail.utoronto.ca",
            password: await hashPassword("lawMelon123@"),
            role: "superuser",
            verified: true,
            suspicious: false,
            points: 1_000_000_000
        }
    })
    console.log("created superuser lawmelon.")

    // create 20 users with easy-to-remember credentials and role-specific prefixes
    const users = []
    let regularCount = 0
    let cashierCount = 0
    let managerCount = 0
    let superuCount = 0
    for (let i = 1; i <= 20; i++) {
        let prefix
        let role
        if (i <= 5) {
            regularCount++
            prefix = `regular${regularCount}`
            role = "regular"
        } else if (i <= 10) {
            cashierCount++
            prefix = `cashier${cashierCount}`
            role = "cashier"
        } else if (i <= 15) {
            managerCount++
            prefix = `manager${managerCount}`
            role = "manager"
        } else {
            superuCount++
            prefix = `superu${superuCount}`
            role = "superuser"
        }
        const utorid = prefix
        const name = `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} User`
        const email = `${utorid}@mail.utoronto.ca`
        const password = await hashPassword("Password123@")
        const birthday = new Date(2000 + i, 0, 1)
        const points = i * 100

        const user = await prisma.user.create({
            data: {
                utorid,
                name,
                email,
                password,
                role,
                verified: i % 2 === 0,
                suspicious: i % 5 === 0,
                birthday,
                points,
            }
        })
        users.push(user)
    }
    console.log(`created ${users.length} users.`)

    // create 15 promotions
    const promotions = []
    for (let i = 1; i <= 15; i++) {
        const name = `Promo ${i}`
        const description = `Description for promo ${i}`
        const type = i % 2 === 0 ? "automatic" : "onetime"
        const rate = i % 3 === 0 ? 0.1 * i : 0
        const points = i % 3 !== 0 ? i * 10 : 0
        const startTime = new Date(2025, 0, i)
        const endTime = new Date(2025, 11, i)
        const minSpending = i % 4 === 0 ? i * 5 : 0

        const promotion = await prisma.promotion.create({
            data: {
                name,
                description,
                type,
                rate,
                points,
                startTime,
                endTime,
                minSpending,
            }
        })
        promotions.push(promotion)

        // assign some users to promotions (e.g., first 5 users to even promotions)
        if (i % 2 === 0) {
            await prisma.promotion.update({
                where: { id: promotion.id },
                data: {
                    users: {
                        connect: users.slice(0, 5).map(u => ({ id: u.id }))
                    }
                }
            })
        }
    }
    console.log(`created ${promotions.length} promotions.`)

    // create 15 events
    const events = []
    for (let i = 1; i <= 15; i++) {
        const name = `Event ${i}`
        const description = `Description for event ${i}`
        const location = `Location ${i}`
        const startTime = new Date(2025, i % 12, 1, 10, 0)
        const endTime = new Date(2025, i % 12, 1, 12, 0)
        const capacity = i * 10
        const pointsRemain = i * 50
        const pointsAwarded = i * 20
        const published = i % 2 === 0

        const event = await prisma.event.create({
            data: {
                name,
                description,
                location,
                startTime,
                endTime,
                capacity,
                pointsRemain,
                pointsAwarded,
                published,
                organizers: {
                    connect: users.slice(0, 2).map(u => ({ id: u.id }))
                },
                guests: {
                    connect: users.slice(2, 7).map(u => ({ id: u.id }))
                }
            }
        })
        events.push(event)
    }
    console.log(`created ${events.length} events.`)

    // create 20 transactions with different types
    let transactionCount = 0
    for (let i = 1; i <= 20; i++) {
        const user = users[i % users.length]
        const type = i % 5 === 0 ? "purchase" :
                     i % 5 === 1 ? "redemption" :
                     i % 5 === 2 ? "adjustment" :
                     i % 5 === 3 ? "event" :
                     "transfer"
        const createdBy = `system${i}`

        let data = {
            user: { connect: { id: user.id } },
            type,
            remark: `Remark for transaction ${i}`,
            suspicious: i % 4 === 0,
            createdBy,
            promotions: {
                connect: i % 3 === 0 ? promotions.slice(0, 2).map(p => ({ id: p.id })) : []
            }
        }

        if (type === "purchase") {
            data.spent = i * 10.5
            data.earned = i * 5
        } else if (type === "redemption") {
            data.redeemed = i * 10
            data.processedBy = `cashier${i}`
        } else if (type === "adjustment") {
            data.amount = i * -2.5
            data.relatedId = i > 1 ? i - 1 : i
        } else if (type === "transfer") {
            data.sender = user.utorid
            data.recipient = users[(i + 1) % users.length].utorid
            data.sent = i * 10
        } else if (type === "event") {
            data.amount = i * 5
            data.relatedId = events[i % events.length].id
        }

        await prisma.transaction.create({ data })
        transactionCount++
    }
    console.log(`created ${transactionCount} transactions.`)

    console.log("seed process completed.")
}

seed()
