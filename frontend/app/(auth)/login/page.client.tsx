"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { LoginInput, LoginSchema } from "@/lib/validation/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { AuthService } from "@/lib/services/auth"
import { jwtDecode } from "jwt-decode"
import { User } from "@/models"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPageClient() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { user, login: authLogin, hydrated } = useAuth()
    // const authLogin = useAuth((s) => s.login)
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginInput>({
        resolver: zodResolver(LoginSchema)
    })

    useEffect(() => {
        if (user) {
            router.replace("/dashboard")
        }
    }, [user, router])

    async function onSubmit({ utorid, password }: LoginInput) {
        setError(null)
        setLoading(true)

        try {
            const { token } = await AuthService.login(utorid, password)

            const decodedUser = jwtDecode<User>(token)
            authLogin(token, decodedUser)

            router.push("/dashboard")
        } catch (error: any) {
            setError(
                error?.response?.data?.message || "Invalid UTORid or password"
            )
        } finally {
            setLoading(false)
        }
    }

    if (!hydrated || user) {
        return null
    }

    return (
        <LoginForm
            onSubmit={handleSubmit(onSubmit)}
            loading={loading}
            error={error}
            register={register}
            errors={errors}
        />
    )
}