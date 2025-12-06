"use client"

import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { User } from "@/models"
import { useRouter } from "next/navigation"

export function NavUser({ user }: { user: User }) {
    const router = useRouter()
    const avatarLetter = user?.name?.charAt(0).toUpperCase() ?? "?"

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
                    onClick={() => {
                        router.push("/dashboard/users/me")
                    }}
                >
                    <div className="flex h-8 w-8 justify-center items-center rounded-full bg-gray-200 text-sm font-semibold">
                        {avatarLetter}
                    </div>

                    <div className="grid flex-1 text-left text-md">
                        {/* <span className="truncate font-lg">{user.name} (@{user.utorid})</span> */}
                        <span className="truncate font-lg">{user.name}</span>
                        <span className="truncate text-xs text-blue-500">{user.email}</span>
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
