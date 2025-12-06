import { Control, UseFormRegister } from "react-hook-form"
import { FormBirthdayField, FormSelectField, FormTextField } from "../forms/form-fields"
import { Button } from "../ui/button"
import { Field, FieldGroup } from "../ui/field"
import { FormMessage } from "../forms/form-message"

interface EditPromotionFormProps {
    register: UseFormRegister<any>
    control: Control<any>
    errors: any
    onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
    loading: boolean
    error: string | null
    success: string | null
    countdown: number | null
}

export function EditPromotionForm({
    register,
    control,
    errors,
    onSubmit,
    loading,
    error,
    success,
    countdown
}: EditPromotionFormProps) {
    const TYPE_OPTIONS = [
        { value: "one-time", label: "One-time" },
        { value: "automatic", label: "Automatic" }
    ]
    const disabled = loading || success !== null

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {error && <FormMessage type="error" message={error} />}
            {success && (
                <FormMessage type="success" message={success} countdown={countdown} />
            )}

            <FormTextField
                name="name"
                label="Name"
                placeholder="Holiday Promo"
                disabled={disabled}
                register={register}
                error={errors.name}
            />

            <FormTextField
                name="description"
                label="Description"
                placeholder="10% off for the winter semester"
                disabled={disabled}
                register={register}
                error={errors.description}
            />

            <FieldGroup className="flex flex-row">
                <FormSelectField
                    name="type"
                    label="Type"
                    disabled={disabled}
                    control={control}
                    options={TYPE_OPTIONS}
                    error={errors.type}
                />

                <FormBirthdayField
                    name="startTime"
                    label="Start time"
                    disabled={disabled}
                    control={control}
                    error={errors.startTime}
                />

                <FormBirthdayField
                    name="endTime"
                    label="End time"
                    disabled={disabled}
                    control={control}
                    error={errors.endTime}
                />
            </FieldGroup>

            <FieldGroup className="flex flex-row">
                <FormTextField
                    name="minSpending"
                    label="Min. spend (optional)"
                    placeholder="0"
                    disabled={disabled}
                    register={register}
                    error={errors.minSpending}
                />

                <FormTextField
                    name="rate"
                    label="Rate (optional)"
                    placeholder="0.1"
                    disabled={disabled}
                    register={register}
                    error={errors.rate}
                />

                <FormTextField
                    name="points"
                    label="Points (optional)"
                    placeholder="50"
                    disabled={disabled}
                    register={register}
                    error={errors.points}
                />
            </FieldGroup>

            <Field>
                <Button type="submit" disabled={disabled}>
                    {loading ? "Updating promotion..." : "Update promotion"}
                </Button>
            </Field>
        </form>
    )
}