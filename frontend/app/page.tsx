"use client"

import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
    const { user } = useAuth()
    const router = useRouter()

    // redirect based on user
    useEffect(() => {
        if (user) {
            router.replace("/dashboard")
        } else {
            router.replace("/login")
        }
    }, [user, router])

    return null
}
