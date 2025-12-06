"use client"

import { useAuth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, Calendar, Users, TrendingUp } from "lucide-react"
import Link from "next/link"
import { User } from "@/models"
import { NumericFormat } from "react-number-format"

export default function DashboardPageClient() {
    const { user, interfaceRole } = useAuth()

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-96">
                    <CardHeader>
                        <CardTitle>Not Authenticated</CardTitle>
                        <CardDescription>Please log in to access the dashboard</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    const role = interfaceRole || user.role

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold">Welcome, {user.name || user.email}</h1>
                    <p className="text-muted-foreground mt-2">
                        {role === "regular" && "Manage your points and access key features"}
                        {role === "cashier" && "Process transactions and redemptions"}
                        {role === "manager" && "Oversee events, promotions, and users"}
                        {role === "superuser" && "Full system administration"}
                    </p>
                </div>
                <Badge variant="default" className="text-lg px-3 py-2">
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                </Badge>
            </div>

            <Card className="bg-gradient-to-r from-sky-400 to-indigo-500 text-white shadow-lg border-0">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Points Balance
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    {/* <div className="text-5xl font-extrabold">{user.points || 0}</div> */}
                    <div className="text-5xl font-extrabold">
                        <NumericFormat
                            value={user.points || 0}
                            thousandSeparator=","
                            displayType="text"    
                        />
                    </div>
                    <p className="text-sm text-blue-100">Your available points</p>
                    {/* <Button asChild variant="secondary" className="mt-2 w-full">
                        <Link href="/dashboard/points">View Points</Link>
                    </Button> */}
                </CardContent>
            </Card>

            <div className="w-full">
                {role === "regular" && <UserCard user={user} />}
                {role === "cashier" && <CashierCard />}
                {(role === "manager" || role === "superuser") && <ManagerCard />}
            </div>
        </div>
    )
}

function UserCard({ user }: { user: User }) {
    return (
        <div className="space-y-4">
            <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Recent Transactions
                    </CardTitle>
                    <CardDescription>Quick access to your latest activity</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild variant="default" className="w-full">
                        <Link href="/dashboard/my-transactions">View My Transactions</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

function CashierCard() {
    const links = [
        { title: "Create Transaction", href: "/dashboard/my-transactions", icon: <Calendar className="h-5 w-5" /> },
        { title: "Process Redemption", href: "/dashboard/redemptions", icon: <Zap className="h-5 w-5" /> },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {links.map((link) => (
                <Card key={link.title}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">{link.icon} {link.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="default" className="w-full">
                            <Link href={link.href}>{link.title}</Link>
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

function ManagerCard() {
    const links = [
        { title: "Manage Events", href: "/dashboard/events", icon: <Calendar className="h-5 w-5" /> },
        { title: "Manage Promotions", href: "/dashboard/promotions", icon: <TrendingUp className="h-5 w-5" /> },
        { title: "Manage Users", href: "/dashboard/users", icon: <Users className="h-5 w-5" /> },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {links.map((link) => (
                <Card key={link.title}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">{link.icon} {link.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="default" className="w-full">
                            <Link href={link.href}>{link.title}</Link>
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
