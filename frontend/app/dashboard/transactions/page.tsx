import { Metadata } from "next"
import TransactionsPageClient from "./page.client"

export const metadata: Metadata = {
    title: "Transactions",
    description: "A page to view all Melona Rewards transactions"
}

export default async function TransactionsPage() {
    return <TransactionsPageClient />
}
