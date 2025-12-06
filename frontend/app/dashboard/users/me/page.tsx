import { Metadata } from "next"
import CurrentUserPageClient from "./page.client"

export const metadata: Metadata = {
    title: "My Profile"
}

export default function CurrentUserPage() {
    return (
        <CurrentUserPageClient />
    )
}