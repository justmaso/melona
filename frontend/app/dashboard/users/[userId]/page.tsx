"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Mail } from "lucide-react"
import { use, useEffect, useState } from "react"
import { useAuth } from "@/lib/auth/store"
import { Permissions, Role } from "@/lib/auth"
import { notFound } from "next/navigation"
import { EditUserDialog } from "@/components/dialogs/edit-user-dialog"
import { UserService } from "@/lib/services/user"
import { User } from "@/models"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function UserPage({ params }: { params: Promise<{ userId: string }> }) {
    const auth = useAuth()
    const { userId } = use(params)
    
    const canEdit = Permissions.updateUser(auth.user?.role as Role)
    const [targetUser, setTargetUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    // fetch target user
    useEffect(() => {
        async function loadUser() {
            try {
                // check permissions
                if (!Permissions.viewUser(auth.user?.role as any)) {
                    notFound()
                }

                // fetch target user
                const response = await UserService.get(userId)
                setTargetUser(response.data)
            } catch {
                notFound()
            } finally {
                setLoading(false)
            }
        }

        loadUser()
    }, [userId, auth.user?.role])

    // handle successful user update (prevent additional backend call)
    function handleUserUpdated(updatedUser: User) {
        setTargetUser(updatedUser)
    }

    if (loading) {
        return <p>Loading…</p>
    }

    if (!targetUser) {
        return <p>User not found</p>
    }

    return (
        <div>
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 mb-4"
                    asChild
                >
                    <Link href="/dashboard/users">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Users
                    </Link>
                </Button>
            </div>

            <h1 className="text-2xl font-bold mb-4">User Profile</h1>
            <Card>
                <CardContent>
                    <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
                        <Avatar className="h-24 w-24">
                            <AvatarFallback className="text-3xl font-bold">
                                {targetUser.name?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-2">
                            <div className="flex flex-row gap-2 md:flex-row md:items-center">
                                <h1 className="text-4xl font-bold">{targetUser?.name}</h1>
                                
                                <Badge variant="default" className="text-md px-3 py-1 mt-2">
                                    {targetUser?.role.charAt(0).toUpperCase() + targetUser!.role.slice(1) || ""}
                                </Badge>

                                <Badge
                                    className={targetUser?.verified
                                        ? "text-md px-3 py-1 mt-2 bg-sky-200 text-sky-500"
                                        : "text-md px-3 py-1 mt-2 bg-red-200 text-red-400"
                                    }
                                >
                                    {targetUser?.verified ? "Verified" : "Not verified"}
                                </Badge>

                                <Badge
                                    className={!targetUser?.suspicious
                                        ? "text-md px-3 py-1 mt-2 bg-sky-200 text-sky-500"
                                        : "text-md px-3 py-1 mt-2 bg-red-200 text-red-400"
                                    }
                                >
                                    {targetUser?.suspicious ? "Suspicious" : "Not suspicious"}
                                </Badge>
                            </div>

                            <div className="text-muted-foreground flex gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                    <Mail className="size-4" />
                                    {targetUser.email}
                                </div>
                            </div>
                        </div>

                        {canEdit && (
                            <EditUserDialog 
                                user={targetUser}
                                onSuccess={handleUserUpdated}
                            />
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}