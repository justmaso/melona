import { Role, hasRole } from "./roles"

export const Permissions = {
    // users
    registerUser: (role: Role) => hasRole(role, Role.CASHIER),
    listUsers: (role: Role) => hasRole(role, Role.MANAGER),
    viewUser: (role: Role) => hasRole(role, Role.CASHIER),
    updateUser: (role: Role) => hasRole(role, Role.MANAGER),
    updateSelf: (role: Role) => hasRole(role, Role.REGULAR),

    // transactions
    createPurchase: (role: Role) => hasRole(role, Role.CASHIER),
    createAdjustment: (role: Role) => hasRole(role, Role.MANAGER),
    listTransactions: (role: Role) => hasRole(role, Role.MANAGER),
    viewTransaction: (role: Role) => hasRole(role, Role.MANAGER),
    viewOwnTransaction: (role: Role) => hasRole(role, Role.REGULAR),
    markSuspicious: (role: Role) => hasRole(role, Role.MANAGER),
    createTransfer: (role: Role) => hasRole(role, Role.REGULAR),
    createRedemption: (role: Role) => hasRole(role, Role.REGULAR),
    processRedemption: (role: Role) => hasRole(role, Role.CASHIER),

    // events
    createEvent: (role: Role) => hasRole(role, Role.MANAGER),
    listEvents: (role: Role) => hasRole(role, Role.REGULAR),
    viewEvent: (role: Role) => hasRole(role, Role.REGULAR),
    updateEvent: (role: Role, isOrganizer = false) => 
        hasRole(role, Role.MANAGER) || isOrganizer,
    deleteEvent: (role: Role) => hasRole(role, Role.MANAGER),
    manageOrganizers: (role: Role) => hasRole(role, Role.MANAGER),
    manageGuests: (role: Role, isOrganizer = false) => 
        hasRole(role, Role.MANAGER) || isOrganizer,
    rsvpToEvent: (role: Role) => hasRole(role, Role.REGULAR),
    createReward: (role: Role, isOrganizer = false) => 
        hasRole(role, Role.MANAGER) || isOrganizer,

    // promotions
    createPromotion: (role: Role) => hasRole(role, Role.MANAGER),
    listPromotions: (role: Role) => hasRole(role, Role.REGULAR),
    viewPromotion: (role: Role) => hasRole(role, Role.REGULAR),
    updatePromotion: (role: Role) => hasRole(role, Role.MANAGER),
    deletePromotion: (role: Role) => hasRole(role, Role.MANAGER)
}