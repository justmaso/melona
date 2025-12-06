import { UserService } from "@/lib/services/user"
import { CreateTransferTransactionForm } from "../transactions/create-transfer-transaction-form"
import { Button } from "../ui/button"
import { FormDialog } from "../forms/form-dialog"
import { useForm } from "react-hook-form"
import { CreateTransferTransactionInput, createTransferTransactionSchema } from "@/lib/validation/transaction"
import { useAuth } from "@/lib/auth"
import { zodResolver } from "@hookform/resolvers/zod"


interface CreateTransferTransactionDialogProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function CreateTransferTransactionDialog({
    open,
    onOpenChange
}: CreateTransferTransactionDialogProps = {}) {
    const { user, refreshUser } = useAuth()
    const userPoints = user?.points || 0

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<CreateTransferTransactionInput>({
        resolver: zodResolver(createTransferTransactionSchema(userPoints)),
        defaultValues: {
            type: "transfer"
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
                title="Transfer points"
                description="Transfer points to another user below"
                successMessage="Transfer completed successfully"
                onSubmit={async (values) => {
                    const { recipientUtorid } = values

                    const recipientResponse = await UserService.getByUtorid(recipientUtorid)
                    const recipientId = recipientResponse.data.id

                    await UserService.transfer(recipientId, values)
                    refreshUser()
                }}
                register={register}
                control={control}
                handleSubmit={handleSubmit}
                errors={errors}
                reset={reset}
                formComponent={CreateTransferTransactionForm}
                shouldRefresh={true}
            />
        </div>
    )
}