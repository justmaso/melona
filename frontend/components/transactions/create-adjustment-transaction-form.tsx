import { Control, UseFormRegister } from "react-hook-form"
import { FormTextField } from "../forms/form-fields"
import { Button } from "../ui/button"
import { Field } from "../ui/field"
import { FormMessage } from "../forms/form-message"

interface CreateAdjustmentTransactionFormProps {
    register: UseFormRegister<any>
    control: Control<any>
    errors: any
    onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
    loading: boolean
    error: string | null
    success: string | null
    countdown: number | null
}

export function CreateAdjustmentTransactionForm({
    register,
    errors,
    onSubmit,
    loading,
    error,
    success,
    countdown
}: CreateAdjustmentTransactionFormProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {error && <FormMessage type="error" message={error} />}
            {success && <FormMessage type="success" message={success} countdown={countdown} />}

            <input type="hidden" {...register("type")} value="adjustment" />

            <FormTextField
                name="utorid"
                label="UTORid"
                placeholder="lawmelon"
                disabled={loading}
                register={register}
                error={errors.utorid}
            />

            <FormTextField
                name="amount"
                label="Adjustment Amount"
                type="number"
                placeholder="100"
                disabled={loading}
                register={register}
                error={errors.amount}
            />

            <FormTextField
                name="relatedId"
                label="Related Transaction ID"
                type="number"
                placeholder="123"
                disabled={loading}
                register={register}
                error={errors.relatedId}
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
                placeholder="Reason for adjustment"
                disabled={loading}
                register={register}
                error={errors.remark}
            />

            <Field>
                <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create adjustment"}
                </Button>
            </Field>
        </form>
    )
}