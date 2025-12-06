import { Control, UseFormRegister } from "react-hook-form"
import { FormTextField } from "../forms/form-fields"
import { Button } from "../ui/button"
import { Field } from "../ui/field"
import { FormMessage } from "../forms/form-message"

interface CreatePurchaseTransactionFormProps {
    register: UseFormRegister<any>
    control: Control<any>
    errors: any
    onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
    loading: boolean
    error: string | null
    success: string | null
    countdown: number | null
}

export function CreatePurchaseTransactionForm({
    register,
    errors,
    onSubmit,
    loading,
    error,
    success,
    countdown
}: CreatePurchaseTransactionFormProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {error && <FormMessage type="error" message={error} />}
            {success && <FormMessage type="success" message={success} countdown={countdown} />}

            <input type="hidden" {...register("type")} value="purchase" />

            <FormTextField
                name="utorid"
                label="UTORid"
                placeholder="lawmelon"
                disabled={loading}
                register={register}
                error={errors.utorid}
            />

            <FormTextField
                name="spent"
                label="Amount Spent"
                type="number"
                step="0.01"
                placeholder="$2"
                disabled={loading}
                register={register}
                error={errors.spent}
            />

            <FormTextField
                name="promotionIds"
                label="Promotion IDs (optional)"
                placeholder="1,2,3"
                disabled={loading}
                register={register}
                error={errors.promotionIds}
            />

            <FormTextField
                name="remark"
                label="Remark (optional)"
                placeholder="Transaction notes"
                disabled={loading}
                register={register}
                error={errors.remark}
            />

            <Field>
                <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create purchase"}
                </Button>
            </Field>
        </form>
    )
}