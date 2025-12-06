import { Metadata } from "next"
import DashboardLayoutClient from "./layout.client"

export const metadata: Metadata = {
    title: {
        default: "Melona Rewards",
        template: "%s | Melona Rewards"
    },
    description: "Melona Rewards"
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardLayoutClient>
            {children}
        </DashboardLayoutClient>
    )
}
