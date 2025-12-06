import { Control, UseFormRegister } from "react-hook-form"
import { FormBirthdayField, FormTextField } from "../forms/form-fields"
import { Field } from "../ui/field"
import { Button } from "../ui/button"
import { FormMessage } from "../forms/form-message"

interface EditProfileFormProps {
    register: UseFormRegister<any>
    control: Control<any>
    errors: any
    onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
    loading: boolean
    error: string | null
    success: string | null
    countdown: number | null
}

export function EditProfileForm({
    register,
    control,
    errors,
    onSubmit,
    loading,
    error,
    success,
    countdown
}: EditProfileFormProps) {
    const disabled = loading || success !== null

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {error && <FormMessage type="error" message={error} />}
            {success && <FormMessage type="success" message={success} countdown={countdown} />}

            <FormTextField
                name="name"
                label="Name"
                type="text"
                placeholder="Maso"
                disabled={disabled}
                register={register}
                error={errors.name}
            />

            <FormTextField
                name="email"
                label="Email"
                type="email"
                placeholder="maso@mail.utoronto.ca"
                disabled={disabled}
                register={register}
                error={errors.email}
            />

            <FormBirthdayField
                name="birthday"
                label="Birthday (optional)"
                disabled={disabled}
                control={control}
                error={errors.birthday}
            />

            <Field>
                <Button type="submit" disabled={loading}>
                    {loading ? "Updating profile..." : "Update profile"}
                </Button>
            </Field>
        </form>
    )
}
