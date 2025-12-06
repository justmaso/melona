import { z } from "zod"
import { Role }from "@/lib/auth/roles"

export const utorid = z
    .string()
    .min(7, "UTORid must be 7-8 characters long")
    .max(8, "UTORid must be 7-8 characters long")
    .regex(/^[a-zA-Z0-9]+$/, "UTORid must be alphanumeric")

export const password = z
    .string()
    .min(8, "Password must be between 8 and 20 characters")
    .max(20, "Password must be between 8 and 20 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[!@#$%^&*()[\]{}\-_+=~`:;"'<>,.?/\\]/, "Password must contain at least one special character")

export const name = z
    .string()
    .min(1, "Name must be 1-50 characters long")
    .max(50, "Name must be 1-50 characters long")

export const email = z
    .string()
    .email("Invalid email format")
    .regex(/^[A-Za-z0-9._%+-]+@mail\.utoronto\.ca$/, "Email must be @mail.utoronto.ca")

export const birthday = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Birthday must be in YYYY-MM-DD format")
    .refine((date) => !isNaN(new Date(date).getTime()), "Invalid date")
    .refine((date) => new Date(date) < new Date(), "Birthday must be in the past")
    .optional()
    .or(z.literal(""))

export const role = z.enum(Role)
