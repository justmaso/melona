import { useAuth } from "./store"
import { Role, hasRole } from "./roles"
import { Permissions } from "./permissions"

export function useRole() {
    return useAuth((state) => state.user?.role || Role.REGULAR)
}

export function useHasRole(requiredRole: Role) {
    const userRole = useRole()
    return hasRole(userRole, requiredRole)
}

export function usePermission(
    permission: keyof typeof Permissions,
    ...args: any[]
) {
    const userRole = useRole()
    return Permissions[permission](userRole, ...args)
}