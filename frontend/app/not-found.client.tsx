"use client"

import Link from "next/link"
import { Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth/store"

export default function NotFoundPageClient() {
    const { user, hydrated } = useAuth()

    if (!hydrated) {
        return
    }

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <a className="flex items-center gap-2 font-medium">
                        <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                            <Code className="size-4" />
                        </div>
                        Melona Rewards
                    </a>
                </div>

                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs text-center space-y-6">

                        <div>
                            <h1 className="text-5xl font-bold mb-2">404</h1>
                            <p className="text-muted-foreground">
                                The page you're looking for doesn't exist.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {user && (
                                <Link href="/dashboard" className="block">
                                    <Button className="w-full">Go to Dashboard</Button>
                                </Link>
                            )}

                            {hydrated && !user && (
                                <Link href="/login" className="block">
                                    <Button variant="default" className="w-full">Go to Login</Button>
                                </Link>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            <div className="bg-muted relative hidden lg:block">
                <img
                    src="/dog-watermelon.jpg"
                    alt="Image"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>

        </div>
    )
}
