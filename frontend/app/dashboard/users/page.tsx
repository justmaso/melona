import { Metadata } from "next"
import UsersPageClient from "./page.client"

export const metadata: Metadata = {
    title: "Users",
    description: "A page to view all Melona Rewards users"
}

export default async function UsersPage() {
    return <UsersPageClient />
}
