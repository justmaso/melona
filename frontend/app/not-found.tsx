import { Metadata } from "next"
import NotFoundPageClient from "./not-found.client";

export const metadata: Metadata = {
    title: "Not Found"
}

export default function NotFoundPage() {
    return (
        <NotFoundPageClient />
    )
}
