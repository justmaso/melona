"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Calendar, DollarSign, Percent, Star, Tag } from "lucide-react"
import { use, useEffect, useState } from "react"
import { useAuth } from "@/lib/auth/store"
import { Permissions, Role } from "@/lib/auth"
import { notFound, useRouter } from "next/navigation"
import { EditPromotionDialog } from "@/components/dialogs/edit-promotion-dialog"
import { DeletePromotionDialog } from "@/components/dialogs/delete-promotion-dialog"
import { PromotionService } from "@/lib/services/promotion"
import { Promotion } from "@/models"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function PromotionPage({ params }: { params: Promise<{ promotionId: string }> }) {
    const auth = useAuth()
    const { promotionId } = use(params)
    const router = useRouter()
    
    const canEdit = Permissions.updatePromotion(auth.user?.role as Role)
    const [promotion, setPromotion] = useState<Promotion | null>(null)
    const [loading, setLoading] = useState(true)

    // fetch promotion
    useEffect(() => {
        // prevent early API calls
        if (!auth.user) {
            return
        }

        async function loadPromotion() {
            try {
                // fetch promotion
                const response = await PromotionService.get(parseInt(promotionId))
                setPromotion(response)
            } catch {
                notFound()
            } finally {
                setLoading(false)
            }
        }

        loadPromotion()
    }, [promotionId, auth.user?.role])

    // handle successful promotion update
    async function handlePromotionUpdated(updatedPromotion: Promotion) {
        setPromotion(updatedPromotion)
    }

    if (loading || !auth.user) {
        return <p>Loading...</p>
    }

    if (!promotion) {
        console.log(promotion)
        return <p>Promotion not found</p>
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const isActive = () => {
        const now = new Date()
        const start = new Date(promotion.startTime!)
        const end = new Date(promotion.endTime)
        return now >= start && now <= end
    }

    const getStatusBadge = () => {
        const now = new Date()
        const start = new Date(promotion.startTime!)
        const end = new Date(promotion.endTime)

        if (now < start) {
            return <Badge variant="secondary">Upcoming</Badge>
        } else if (now > end) {
            return <Badge variant="outline">Expired</Badge>
        } else {
            return <Badge variant="default">Active</Badge>
        }
    }

    return (
        <div>
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/dashboard/promotions")}
                    className="flex items-center gap-2 mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Promotions
                </Button>
            </div>

            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Promotion Details</h1>
                {getStatusBadge()}
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-3xl font-bold">{promotion.name}</h2>
                                    <Badge variant={promotion.type === "one-time" ? "secondary" : "default"}>
                                        {promotion.type === "one-time" ? "One-time" : "Automatic"}
                                    </Badge>
                                </div>
                                <p className="text-muted-foreground text-lg">{promotion.description}</p>
                            </div>

                            {canEdit && (
                                <div className="flex items-center gap-2">
                                    <EditPromotionDialog 
                                        promotion={promotion}
                                        onSuccess={handlePromotionUpdated}
                                    />

                                    <DeletePromotionDialog promotionId={promotion.id} />
                                </div>
                            )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2 p-4 rounded-lg border">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <Calendar className="size-4" />
                                    Duration
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm">
                                        <span className="font-medium">Start:</span> {formatDate(promotion.startTime!)}
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-medium">End:</span> {formatDate(promotion.endTime)}
                                    </p>
                                </div>
                            </div>

                            {promotion.minSpending !== null && promotion.minSpending > 0 && (
                                <div className="space-y-2 p-4 rounded-lg border">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <DollarSign className="size-4" />
                                        Minimum Spending
                                    </div>
                                    <p className="text-2xl font-bold">${promotion.minSpending.toFixed(2)}</p>
                                </div>
                            )}

                            {promotion.rate !== null && promotion.rate > 0 && (
                                <div className="space-y-2 p-4 rounded-lg border">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <Percent className="size-4" />
                                        Promotional Rate
                                    </div>
                                    <p className="text-2xl font-bold">{(promotion.rate * 100).toFixed(1)}%</p>
                                    <p className="text-xs text-muted-foreground">Additional discount rate</p>
                                </div>
                            )}

                            {promotion.points !== null && promotion.points > 0 && (
                                <div className="space-y-2 p-4 rounded-lg border">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <Star className="size-4" />
                                        Bonus Points
                                    </div>
                                    <p className="text-2xl font-bold">{promotion.points}</p>
                                    <p className="text-xs text-muted-foreground">Points awarded</p>
                                </div>
                            )}
                        </div>

                        {!promotion.rate && !promotion.points && !promotion.minSpending && (
                            <div className="p-4 rounded-lg border border-dashed">
                                <p className="text-sm text-muted-foreground text-center">
                                    No additional promotion details added
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}