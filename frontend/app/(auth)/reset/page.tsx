import { Metadata } from "next";
import ResetRequestPageClient from "./page.client";

export const metadata: Metadata = {
    title: "Reset Password"
}

export default function ResetRequestPage() {
    return (
        <ResetRequestPageClient />
    )
}