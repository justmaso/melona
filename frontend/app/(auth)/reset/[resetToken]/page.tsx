import { Metadata } from "next";
import ResetPasswordPageClient from "./page.client";

export const metadata: Metadata = {
    title: "Set Password"
}

export default function ResetPasswordPage() {
    return (
        <ResetPasswordPageClient />
    )
}