"use client"

import { CreateRedemptionTransactionInput, createRedemptionTransactionSchema, CreateRedemptionTransactionSchema } from "@/lib/validation/transaction"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { FormDialog } from "../forms/form-dialog"
import { Button } from "../ui/button"
import { CreateRedemptionTransactionForm } from "../transactions/create-redemption-transaction-form"
import { UserService } from "@/lib/services/user"
import { useAuth } from "@/lib/auth"

interface CreateRedemptionTransactionDialogProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function CreateRedemptionTransactionDialog({
    open,
    onOpenChange
}: CreateRedemptionTransactionDialogProps = {}) {
    const { user } = useAuth()
    const userPoints = user?.points || 0

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<CreateRedemptionTransactionInput>({
        resolver: zodResolver(createRedemptionTransactionSchema(userPoints)),
        defaultValues: {
            type: "redemption"
        }
    })

    const showTrigger = !open && !onOpenChange

    return (
        <div className="flex justify-end mb-3">
            <FormDialog
                open={open}
                onOpenChange={onOpenChange}
                // trigger={<Button variant="default">Redeem points</Button>}
                trigger={showTrigger ? <Button variant="default">Create purchase</Button> : null}
                title="Redeem points"
                description="Create a redemption request"
                successMessage="Redemption request created successfully"
                onSubmit={async (values) => {
                    await UserService.createMyRedemption(values)
                }}
                register={register}
                control={control}
                handleSubmit={handleSubmit}
                errors={errors}
                reset={reset}
                formComponent={CreateRedemptionTransactionForm}
                shouldRefresh={true}
            />
        </div>
    )
}