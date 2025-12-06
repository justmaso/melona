"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
    const { user, token, hydrated } = useAuth()
    const router = useRouter()
    
    useEffect(() => {
        if (hydrated && (!user || !token)) {
            router.replace("/login")
        }
    }, [user, token, router, hydrated])

    // show nothing while checking auth or not hydrated
    if (!hydrated || !user || !token) {
        return null
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="m-6 w-full">
                <SidebarTrigger className="h-10 w-10 mb-3" />
                {children}
            </main>
        </SidebarProvider>
    )
}
