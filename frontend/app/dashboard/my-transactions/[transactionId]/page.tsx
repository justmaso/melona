"use client"

import { use, useEffect, useState } from "react"
import { useAuth } from "@/lib/auth/store"
import { Permissions, Role } from "@/lib/auth"
import { notFound } from "next/navigation"
import { TransactionService } from "@/lib/services/transaction"
import { Transaction, TransactionType } from "@/models"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, DollarSign, User, Clock } from "lucide-react"
import Link from "next/link"
import { NumericFormat } from "react-number-format"

export default function MyTransactionPage({ params }: { params: Promise<{ transactionId: string }> }) {
    const auth = useAuth()
    const { transactionId } = use(params)

    const [transaction, setTransaction] = useState<Transaction | null>(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        async function loadTransaction() {
            try {
                if (!Permissions.viewOwnTransaction(auth.user?.role as Role)) {
                    notFound()
                }

                const data = await TransactionService.get(Number(transactionId), true)
                setTransaction(data)
            } catch {
                notFound()
            } finally {
                setLoading(false)
            }
        }
        
        loadTransaction()
    }, [transactionId, auth.user?.role])

    const handleToggleSuspicious = async () => {
        if (!transaction) return
        setProcessing(true)
        try {
            const updated = await TransactionService.setSuspicious(transaction.id, !transaction.suspicious)
            setTransaction((prev) => prev && { ...prev, suspicious: updated.suspicious })
        } finally {
            setProcessing(false)
        }
    }

    const handleProcessRedemption = async () => {
        if (!transaction || transaction.type !== "redemption") return
        setProcessing(true)
        try {
            const updated = await TransactionService.processRedemption(transaction.id)
            setTransaction((prev) => prev && { ...prev, processedBy: updated.processedBy })
        } finally {
            setProcessing(false)
        }
    }

    const getTypeColor = (type: TransactionType) => {
        switch (type) {
            case "purchase":
                return "bg-green-200 text-green-600"
            case "redemption":
                return "bg-yellow-200 text-yellow-600"
            case "adjustment":
                return "bg-blue-200 text-blue-600"
            case "transfer":
                return "bg-purple-200 text-purple-600"
            default:
                return "bg-gray-200 text-gray-600"
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) return <p>Loading...</p>
    if (!transaction) return <p>Transaction not found</p>

    return (
        <div>
            <div className="flex items-center gap-4 mb-4">
                <Button variant="outline" size="sm" asChild className="flex items-center gap-2">
                    <Link href="/dashboard/my-transactions">
                        <ArrowLeft className="h-4 w-4" />
                        Back to My Transactions
                    </Link>
                </Button>
            </div>

            <h1 className="text-2xl font-bold mb-4">Transaction Details</h1>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-3xl font-bold">{transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} {transaction.id}</h2>
                                    <Badge className={getTypeColor(transaction.type)}>
                                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                    </Badge>
                                    {/* <Badge
                                        variant={transaction.suspicious ? "destructive" : "secondary"}
                                    >
                                        {transaction.suspicious ? "Suspicious" : "Not suspicious"}
                                    </Badge> */}
                                </div>
                                {transaction.remark && (
                                    <p className="text-muted-foreground text-lg">{transaction.remark}</p>
                                )}
                            </div>
                        </div>

                        {/* <div className="grid gap-4 md:grid-cols-2"> */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2 p-4 rounded-lg border">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <User className="size-4" />
                                    Created By
                                </div>
                                <p className="text-lg font-medium">{transaction.createdBy}</p>
                            </div>

                            <div className="space-y-2 p-4 rounded-lg border">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <Clock className="size-4" />
                                    Created At
                                </div>
                                <p className="text-lg font-medium">{formatDate(transaction.createdAt)}</p>
                            </div>

                            {transaction.updatedAt && (
                                <div className="space-y-2 p-4 rounded-lg border">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <Calendar className="size-4" />
                                        Updated At
                                    </div>
                                    <p className="text-lg font-medium">{formatDate(transaction.updatedAt)}</p>
                                </div>
                            )}

                            {transaction.promotionIds && transaction.promotionIds.length > 0 && (
                                <div className="space-y-2 p-4 rounded-lg border">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <DollarSign className="size-4" />
                                        Promotion IDs
                                    </div>
                                    <p className="text-lg font-medium">{transaction.promotionIds.join(", ")}</p>
                                </div>
                            )}
                        </div>

                        {/* Transaction Type Specific Fields */}
                        <div className="space-y-4 p-4 rounded-lg border border-dashed">
                            <h3 className="font-semibold">Transaction Details</h3>
                            
                            {transaction.type === "purchase" && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Spent</p>
                                        {/* <p className="text-2xl font-bold">{transaction.spent ? `$${transaction.spent.toFixed(2)}` : "-"}</p> */}
                                        <p className="text-2xl font-bold">{transaction.spent ? <NumericFormat value={transaction.spent} thousandSeparator="," displayType="text" fixedDecimalScale /> : "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Earned</p>
                                        {/* <p className="text-2xl font-bold">{transaction.earned ?? "-"}</p> */}
                                        <p className="text-2xl font-bold">{transaction.earned ? <NumericFormat value={transaction.earned} thousandSeparator="," displayType="text" fixedDecimalScale /> : "-"}</p>
                                    </div>
                                </div>
                            )}

                            {transaction.type === "adjustment" && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Amount</p>
                                        {/* <p className="text-2xl font-bold">{transaction.amount ?? "-"}</p> */}
                                        <p className="text-2xl font-bold">{transaction.amount ? <NumericFormat value={transaction.amount} thousandSeparator="," displayType="text" fixedDecimalScale /> : "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Related Transaction ID</p>
                                        <p className="text-2xl font-bold">{transaction.relatedId ?? "-"}</p>
                                    </div>
                                </div>
                            )}

                            {transaction.type === "redemption" && (
                                <div className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Redeemed</p>
                                            {/* <p className="text-2xl font-bold">{transaction.redeemed ?? "-"}</p> */}
                                            <p className="text-2xl font-bold">{transaction.redeemed ? <NumericFormat value={transaction.redeemed} thousandSeparator="," displayType="text" fixedDecimalScale /> : "-"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Processed By</p>
                                            <p className="text-2xl font-bold">{transaction.processedBy ?? "-"}</p>
                                        </div>
                                    </div>
                                    {!transaction.processedBy && (
                                        <Button onClick={handleProcessRedemption} disabled={processing} className="w-full">
                                            {processing ? "Processing..." : "Mark as Processed"}
                                        </Button>
                                    )}
                                </div>
                            )}

                            {transaction.type === "transfer" && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Sender</p>
                                        <p className="text-2xl font-bold">{transaction.sender ?? "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Recipient</p>
                                        <p className="text-2xl font-bold">{transaction.recipient ?? "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Sent</p>
                                        {/* <p className="text-2xl font-bold">{transaction.sent ? `$${transaction.sent.toFixed(2)}` : "-"}</p> */}
                                        <p className="text-2xl font-bold">{transaction.sent ? <NumericFormat value={transaction.sent} thousandSeparator="," displayType="text" fixedDecimalScale /> : "-"}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* <Button
                            variant={transaction.suspicious ? "destructive" : "outline"}
                            onClick={handleToggleSuspicious}
                            disabled={processing}
                            className="w-full"
                        >
                            {processing
                                ? "Updating..."
                                : transaction.suspicious
                                ? "Mark as Not Suspicious"
                                : "Mark as Suspicious"}
                        </Button> */}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}