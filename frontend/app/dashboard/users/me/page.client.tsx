"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth/store"
import { ArrowLeft, Calendar, Mail } from "lucide-react"
import { EditProfileDialog } from "@/components/dialogs/edit-profile-dialog"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function CurrentUserPageClient() {
    const { user, refreshUser } = useAuth()
    const router = useRouter()

    useEffect(() => {
        refreshUser()
    }, [])

    return (
        <div>
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/dashboard")}
                    className="flex items-center gap-2 mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                </Button>
            </div>
            <h1 className="text-2xl font-bold mb-4">My Profile</h1>
            <Card>
                <CardContent>
                    <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
                        <div className="relative">
                            <Avatar className="h-24 w-24">
                                <AvatarFallback className="text-3xl font-bold">
                                    {user?.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex flex-row gap-2 md:flex-row md:items-center">
                                <h1 className="text-4xl font-bold">{user?.name}</h1>
                                <Badge variant="default" className="text-md px-3 py-1 mt-2">
                                    {user?.role.charAt(0).toUpperCase() + user!.role.slice(1) || ""}
                                </Badge>

                                <Badge
                                    className={user?.verified
                                        ? "text-md px-3 py-1 mt-2 bg-sky-200 text-sky-500"
                                        : "text-md px-3 py-1 mt-2 bg-red-200 text-red-400"
                                    }
                                >
                                    {user?.verified ? "Verified" : "Not verified"}
                                </Badge>
                            </div>
                            {/* <p className="text-muted-foreground">{user?.role}</p> */}
                            <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                    <Mail className="size-4" />
                                    {user?.email}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="size-4" />
                                    {user?.birthday ? user.birthday.slice(0, 10) : "No birthday set"}
                                </div>
                            </div>
                        </div>

                        <EditProfileDialog
                            trigger={<Button variant="default">Edit profile</Button>}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
