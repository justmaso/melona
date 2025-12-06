"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreatePurchaseTransactionDialog } from "../dialogs/create-purchase-transaction-dialog"
import { CreateAdjustmentTransactionDialog } from "../dialogs/create-adjustment-transaction-dialog"
import { CreateRedemptionTransactionDialog } from "../dialogs/create-redemption-transaction-dialog"
import { CreateTransferTransactionDialog } from "../dialogs/create-transfer-transaction-dialog"
import { useState } from "react"

interface CreateTransactionDropdownMenuProps {
    viewingFromMyTransactions?: boolean
}

export function CreateTransactionDropdownMenu({
    viewingFromMyTransactions = false
}: CreateTransactionDropdownMenuProps) {

    // higher clearance roles
    const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
    const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false)

    // any clearance roles
    const [showRedemptionDialog, setShowRedemptionDialog] = useState(false)
    const [showTransferDialog, setShowTransferDialog] = useState(false)

    return (
        <div className="flex flex-row-reverse">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="default">Create transaction</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                        {!viewingFromMyTransactions ? (
                            <>
                                <DropdownMenuItem onSelect={() => setShowPurchaseDialog(true)}>
                                    Purchase
                                </DropdownMenuItem>

                                <DropdownMenuItem onSelect={() => setShowAdjustmentDialog(true)}>
                                    Adjustment
                                </DropdownMenuItem>
                            </>
                        ): (
                            <>
                                <DropdownMenuItem onSelect={() => setShowRedemptionDialog(true)}>
                                    Redemption
                                </DropdownMenuItem>

                                <DropdownMenuItem onSelect={() => setShowTransferDialog(true)}>
                                    Transfer
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            {!viewingFromMyTransactions ? (
                <>
                    <CreatePurchaseTransactionDialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog} />
                    <CreateAdjustmentTransactionDialog open={showAdjustmentDialog} onOpenChange={setShowAdjustmentDialog} />
                </>
            ): (
                <>
                    <CreateRedemptionTransactionDialog open={showRedemptionDialog} onOpenChange={setShowRedemptionDialog} />
                    <CreateTransferTransactionDialog open={showTransferDialog} onOpenChange={setShowTransferDialog} />
                </>
            )}
        </div>
    )
}
