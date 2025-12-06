"use client"

import { CreatePurchaseTransactionInput, CreatePurchaseTransactionSchema, promotionIds } from "@/lib/validation/transaction"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormDialog } from "../forms/form-dialog"
import { Button } from "../ui/button"
import { CreatePurchaseTransactionForm } from "../transactions/create-purchase-transaction-form"
import { TransactionService } from "@/lib/services/transaction"
import { useForm } from "react-hook-form"

interface CreatePurchaseTransactionDialogProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function CreatePurchaseTransactionDialog({
    open,
    onOpenChange
}: CreatePurchaseTransactionDialogProps = {}) {
    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<CreatePurchaseTransactionInput>({
        resolver: zodResolver(CreatePurchaseTransactionSchema),
        defaultValues: {
            type: "purchase"
        }
    })

    const showTrigger = !open && !onOpenChange

    return (
        <div className="flex justify-end mb-3">
            <FormDialog
                open={open}
                onOpenChange={onOpenChange}
                // trigger={<Button variant="default">Create purchase</Button>}
                trigger={showTrigger ? <Button variant="default">Create purchase</Button> : null}
                title="Create purchase transaction"
                description="Record a new purchase transaction"
                successMessage="Purchase transaction created successfully"
                onSubmit={async (values) => {
                    // transform due to the promotion IDs being a string
                    const dataToSend = {
                        ...values,
                        promotionIds: values.promotionIds
                            ? values.promotionIds.split(",")
                                .map((v => Number(v.trim())))
                            : undefined
                    }

                    await TransactionService.create(dataToSend)
                }}
                register={register}
                control={control}
                handleSubmit={handleSubmit}
                errors={errors}
                reset={reset}
                formComponent={CreatePurchaseTransactionForm}
                shouldRefresh={true}
            />
        </div>
    )
}