"use client"

import * as React from "react"
import { ChevronRight, Users, Receipt, Calendar, Tag, User, Settings, LogOut, Home } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

import { RoleSwitcher } from "@/components/role-switcher"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarFooter,
} from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth"
import { Role, Permissions } from "@/lib/auth"
import { NavUser } from "./nav-user"

interface NavItem {
    title: string
    url: string
    icon?: React.ComponentType<{ className?: string }>
    isActive?: boolean
    requiredPermission?: (role: Role) => boolean
}

interface NavGroup {
    title: string
    items: NavItem[]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const user = useAuth((s) => s.user)
    const interfaceRole = useAuth((s) => s.interfaceRole)
    const currentRole = interfaceRole || user?.role
    const logout = useAuth((s) => s.logout)
    const router = useRouter()


    // all nav items with respective permission requirements
    const navGroups: NavGroup[] = [
        {
            title: "Personal",
            items: [
                {
                    title: "My Profile",
                    url: "/dashboard/users/me",
                    icon: User,
                    requiredPermission: Permissions.updateSelf,
                },
                {
                    title: "My Transactions",
                    url: "/dashboard/my-transactions",
                    icon: Receipt,
                    requiredPermission: Permissions.updateSelf,
                }
            ],
        },
        // {
        //     title: "Events",
        //     items: [
        //         {
        //             title: "Browse Events",
        //             url: "/dashboard/events",
        //             icon: Calendar,
        //             requiredPermission: Permissions.listEvents,
        //         },
        //         {
        //             title: "Manage Events",
        //             url: "/dashboard/events/manage",
        //             icon: Settings,
        //             requiredPermission: Permissions.createEvent,
        //         },
        //     ],
        // },
        {
            title: "Management",
            items: [
                {
                    title: "Users",
                    url: "/dashboard/users",
                    icon: Users,
                    requiredPermission: Permissions.listUsers,
                },
                {
                    title: "Transactions",
                    url: "/dashboard/transactions",
                    icon: Receipt,
                    requiredPermission: Permissions.listTransactions,
                },
                {
                    title: "Promotions",
                    url: "/dashboard/promotions",
                    icon: Tag,
                    requiredPermission: Permissions.createPromotion,
                },
            ],
        },
    ]

    // filter nav items based on current role
    const filteredNavGroups = React.useMemo(() => {
        if (!currentRole) return []

        return navGroups
            .map((group) => ({
                ...group,
                items: group.items.filter((item) =>
                    item.requiredPermission ? item.requiredPermission(currentRole) : true
                ),
            }))
            .filter((group) => group.items.length > 0) // remove empty groups
    }, [currentRole])

    if (!user) return null

    const handleLogout = () => {
        logout()
        router.replace("/login")
    }

    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <RoleSwitcher />
                <SidebarMenuItem key="home">
                    <SidebarMenuButton
                        asChild
                        isActive={pathname === "/dashboard"}
                    >
                        <a href="/dashboard">
                            <Home className="h-4 w-4" />
                            Home
                        </a>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarHeader>

            <SidebarContent className="gap-0">
                {filteredNavGroups.map((group) => (
                    <Collapsible
                        key={group.title}
                        title={group.title}
                        defaultOpen
                        className="group/collapsible"
                    >
                        <SidebarGroup>
                            <SidebarGroupLabel
                                asChild
                                className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
                            >
                                <CollapsibleTrigger>
                                    {group.title}{" "}
                                    <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                </CollapsibleTrigger>
                            </SidebarGroupLabel>
                            <CollapsibleContent>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        {group.items.map((item) => {
                                            const Icon = item.icon
                                            const isActive = pathname === item.url

                                            return (
                                                <SidebarMenuItem key={item.title}>
                                                    <SidebarMenuButton
                                                        asChild
                                                        isActive={isActive}
                                                    >
                                                        <a href={item.url}>
                                                            {Icon && (
                                                                <Icon className="h-4 w-4" />
                                                            )}
                                                            {item.title}
                                                        </a>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            )
                                        })}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </CollapsibleContent>
                        </SidebarGroup>
                    </Collapsible>
                ))}
            </SidebarContent>

            <SidebarFooter className="mb-3">
                <NavUser user={user}/>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <button
                                onClick={handleLogout}
                                className="w-full hover"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </button>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}
