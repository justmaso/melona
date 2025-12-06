"use client"

import { useState } from "react"
import { PromotionService } from "@/lib/services/promotion"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

export function DeletePromotionDialog({ promotionId }: { promotionId: number }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleDelete() {
        try {
            setLoading(true)
            await PromotionService.delete(promotionId)
            router.push("/dashboard/promotions")
        } catch (err) {
            console.error(err)
            alert("Failed to delete promotion.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="destructive">Delete</Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Promotion</DialogTitle>
                </DialogHeader>

                <p className="text-sm text-muted-foreground">
                    Are you sure you want to delete this promotion?
                    This action cannot be undone.
                </p>

                <DialogFooter>
                    <Button 
                        variant="destructive" 
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
