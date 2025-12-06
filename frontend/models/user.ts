import { Role } from "@/lib/auth/roles"

export interface User {
    id: number
    utorid: string
    name: string
    email: string
    role: Role
    points: number
    verified: boolean
    suspicious: boolean
    birthday?: string
    lastLogin?: string

    // for interface switching
    currentInterface?: Role
}