#!/usr/bin/env node
"use strict"

const port = (() => {
    const args = process.argv

    if (args.length !== 3) {
        console.error("usage: node index.js port")
        process.exit(1)
    }

    const num = parseInt(args[2], 10)
    if (isNaN(num)) {
        console.error("error: argument must be an integer.")
        process.exit(1)
    }

    return num
})()

const express = require("express")
const cors = require("cors")
const routes = require("./routes/index")
const errorHandler = require("./middleware/errorHandler")

const app = express()

// middleware
// app.use(cors())
app.use(cors({
    // origin: "http://localhost:3000",
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}))
app.use(express.json())
app.use("/", routes)
app.use(errorHandler)

const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})

server.on("error", (err) => {
    console.error(`cannot start server: ${err.message}`)
    process.exit(1)
})