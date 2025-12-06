import { Metadata } from "next"
import PromotionsPageClient from "./page.client"

export const metadata: Metadata = {
    title: "Promotions",
    description: "A page to view all promotions on Melona Rewards"
}

export default async function UsersPage() {
    return <PromotionsPageClient />
}
