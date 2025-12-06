import { ReactNode } from "react"
import { useHasRole, usePermission } from "./hooks"
import { Role } from "./roles"
import { Permissions } from "./permissions"

interface RequireRoleProps {
    role: Role
    children: ReactNode
    fallback?: ReactNode
}

export function RequireRole({ role, children, fallback = null }: RequireRoleProps) {
    const hasRequiredRole = useHasRole(role)
    return hasRequiredRole ? <>{children}</> : <>{fallback}</>
}

interface RequirePermissionProps {
    permission: keyof typeof Permissions
    args?: any[]
    children: ReactNode
    fallback?: ReactNode
}

export function RequirePermission({ 
    permission, 
    args = [], 
    children, 
    fallback = null 
}: RequirePermissionProps) {
    const hasPermission = usePermission(permission, ...args)
    return hasPermission ? <>{children}</> : <>{fallback}</>
}
