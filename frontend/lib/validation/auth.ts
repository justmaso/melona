import { z } from "zod"
import { utorid, password } from "./fields"

export const LoginSchema = z.object({
    utorid,
    password
})

export const RequestResetSchema = z.object({
    utorid
})

export const ResetPasswordSchema = z.object({
    password,
    confirmPassword: z.string()
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords don't match",
        path: ["confirmPassword"]
    }
)

export type LoginInput = z.infer<typeof LoginSchema>
export type RequestResetInput = z.infer<typeof RequestResetSchema>
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>
