"use client"

import {
    Check,
    ChevronsUpDown,
    Shield,
    User,
    Briefcase,
    Crown
} from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth"
import { Role, getAvailableRoles } from "@/lib/auth/roles"

const ROLE_CONFIG = {
    [Role.REGULAR]: {
        icon: User,
        label: "Regular",
        shortLabel: "Regular",
    },
    [Role.CASHIER]: {
        icon: Briefcase,
        label: "Cashier",
        shortLabel: "Cashier",
    },
    [Role.MANAGER]: {
        icon: Shield,
        label: "Manager",
        shortLabel: "Manager",
    },
    [Role.SUPERUSER]: {
        icon: Crown,
        label: "Superuser",
        shortLabel: "Superuser",
    },
}

export function RoleSwitcher() {
    const user = useAuth((s) => s.user)
    const interfaceRole = useAuth((s) => s.interfaceRole)
    const switchRole = useAuth((s) => s.switchInterface)

    if (!user) return null

    // Use interfaceRole if set, otherwise fall back to user's actual role
    const activeRole = interfaceRole || user.role

    const availableRoles = getAvailableRoles(user.role)
    
    // don't show the role switcher if only one role is available
    if (availableRoles.length <= 1) return null

    const ActiveIcon = ROLE_CONFIG[activeRole].icon

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
                                <ActiveIcon className="size-4" />
                            </div>
                            <div className="flex flex-col gap-0.5 leading-none">
                                <span className="font-semibold">View as</span>
                                <span className="text-xs">{ROLE_CONFIG[activeRole].label}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width]"
                        align="start"
                    >
                        {availableRoles.map((role) => {
                            const Icon = ROLE_CONFIG[role].icon
                            const isActive = role === activeRole
                            
                            return (
                                <DropdownMenuItem
                                    key={role}
                                    onSelect={() => switchRole(role)}
                                >
                                    <Icon className="mr-2 size-4" />
                                    {ROLE_CONFIG[role].label}
                                    {isActive && <Check className="ml-auto size-4" />}
                                </DropdownMenuItem>
                            )
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}