import { z } from "zod"
import { utorid, name, email, birthday, role } from "./fields"

export const CreateUserSchema = z.object({
    utorid,
    name,
    email
})

export const UpdateProfileSchema = z.object({
    name,
    email,
    birthday
})

export const UpdateUserSchema = z.object({
    email,
    verified: z.boolean(),
    suspicious: z.boolean(),
    role
})

export type CreateUserInput = z.infer<typeof CreateUserSchema>
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
