export enum Role {
    REGULAR = "regular",
    CASHIER = "cashier",
    MANAGER = "manager",
    SUPERUSER = "superuser"
}

const ROLE_HIERARCHY: Record<Role, number> = {
    [Role.REGULAR]: 0,
    [Role.CASHIER]: 1,
    [Role.MANAGER]: 2,
    [Role.SUPERUSER]: 3
}

export function hasRole(userRole: Role, requiredRole: Role): boolean {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

export function getAvailableRoles(userRole: Role): Role[] {
    const userLevel = ROLE_HIERARCHY[userRole]
    return Object.entries(ROLE_HIERARCHY)
        .filter(([_, level]) => level <= userLevel)
        .map(([role]) => role as Role)
}
