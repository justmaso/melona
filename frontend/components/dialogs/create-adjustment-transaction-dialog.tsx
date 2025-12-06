"use client"

import { CreateAdjustmentTransactionInput, CreateAdjustmentTransactionSchema } from "@/lib/validation/transaction"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { FormDialog } from "../forms/form-dialog"
import { Button } from "../ui/button"
import { CreateAdjustmentTransactionForm } from "../transactions/create-adjustment-transaction-form"
import { TransactionService } from "@/lib/services/transaction"

interface CreateAdjustmentTransactionDialogProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function CreateAdjustmentTransactionDialog({
    open,
    onOpenChange
}: CreateAdjustmentTransactionDialogProps = {}) {
    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<CreateAdjustmentTransactionInput>({
        resolver: zodResolver(CreateAdjustmentTransactionSchema),
        defaultValues: {
            type: "adjustment"
        }
    })

    const showTrigger = !open && !onOpenChange

    return (
        <div className="flex justify-end mb-3">
            <FormDialog
                open={open}
                onOpenChange={onOpenChange}
                // trigger={<Button variant="default">Create adjustment</Button>}
                trigger={showTrigger ? <Button variant="default">Create adjustment</Button> : null}
                title="Create adjustment transaction"
                description="Manually adjust a user's points"
                successMessage="Adjustment transaction created successfully"
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
                formComponent={CreateAdjustmentTransactionForm}
                shouldRefresh={true}
            />
        </div>
    )
}