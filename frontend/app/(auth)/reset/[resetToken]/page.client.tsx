"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useParams } from "next/navigation"
import { ResetPasswordSchema, ResetPasswordInput } from "@/lib/validation/auth"
import { AuthService } from "@/lib/services/auth"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export default function ResetPasswordPageClient() {
    const [loading, setLoading] = useState(false)
    const [verifying, setVerifying] = useState(true)
    const [utorid, setUtorid] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [countdown, setCountdown] = useState<number | null>(null)

    const router = useRouter()
    const params = useParams()
    const resetToken = params.resetToken as string

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<ResetPasswordInput>({
        resolver: zodResolver(ResetPasswordSchema)
    })

    useEffect(() => {
        async function verify() {
            try {
                const { utorid } = await AuthService.verifyResetToken(resetToken)
                setUtorid(utorid)
            } catch (err: any) {
                setError("Invalid or expired reset link")
            } finally {
                setVerifying(false)
            }
        }
        verify()
    }, [resetToken])

    useEffect(() => {
        if (countdown === null) return

        if (countdown === 0) {
            router.push("/login")
            return
        }

        const timer = setTimeout(() => {
            setCountdown(countdown - 1)
        }, 1000)

        return () => clearTimeout(timer)
    }, [countdown, router])

    async function onSubmit(values: ResetPasswordInput) {
        setError(null)
        setSuccess(null)
        setLoading(true)

        try {
            await AuthService.resetPasswordViaResetToken(
                resetToken,
                utorid!,
                values.password
            )
            setSuccess("Password reset successful")
            setCountdown(3)
        } catch (err: any) {
            setError(
                err?.response?.data?.message || 
                "Invalid or expired reset link. Please request a new one"
            )
        } finally {
            setLoading(false)
        }
    }

    if (verifying) {
        return (
            <div className="text-center">
                Verifying reset link...
            </div>
        )
    }

    return (
        <ResetPasswordForm
            onSubmit={handleSubmit(onSubmit)}
            loading={loading}
            error={error}
            success={success}
            countdown={countdown}
            register={register}
            errors={errors}
        />
    )
}