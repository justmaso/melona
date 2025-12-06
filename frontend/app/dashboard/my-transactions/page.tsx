import { Metadata } from "next"
import MyTransactionsPageClient from "./page.client"

export const metadata: Metadata = {
    title: "My Transactions",
    description: "A page to view all of your Melona Rewards transactions"
}

export default async function TransactionsPage() {
    return <MyTransactionsPageClient />
}
