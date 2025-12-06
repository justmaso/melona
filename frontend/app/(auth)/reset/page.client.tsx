"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { RequestResetSchema, RequestResetInput } from "@/lib/validation/auth"
import { AuthService } from "@/lib/services/auth"
import { useRouter } from "next/navigation"
import { RequestResetForm } from "@/components/auth/request-reset-form"

export default function ResetRequestPageClient() {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<RequestResetInput>({
        resolver: zodResolver(RequestResetSchema)
    })

    async function onSubmit(values: RequestResetInput) {
        setError(null)
        setSuccess(null)
        setLoading(true)

        try {
            const { resetToken } = await AuthService.requestPasswordReset(values.utorid)
            router.push(`/reset/${resetToken}`)
        } catch (err: any) {
            setError(
                err?.response?.data?.message || "Unable to process reset request"
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <RequestResetForm
            onSubmit={handleSubmit(onSubmit)}
            loading={loading}
            error={error}
            success={success}
            register={register}
            errors={errors}
        />
    )
}