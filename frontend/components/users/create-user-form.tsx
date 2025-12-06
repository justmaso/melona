import { Control, UseFormRegister } from "react-hook-form"
import { FormTextField } from "../forms/form-fields"
import { Button } from "../ui/button"
import { Field } from "../ui/field"
import { FormMessage } from "../forms/form-message"

interface CreateUserFormProps {
    register: UseFormRegister<any>
    control: Control<any>
    errors: any
    onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
    loading: boolean
    error: string | null
    success: string | null
    countdown: number | null
}

export function CreateUserForm({
    register,
    control,
    errors,
    onSubmit,
    loading,
    error,
    success,
    countdown
}: CreateUserFormProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {error && <FormMessage type="error" message={error} />}
            {success && <FormMessage type="success" message={success} countdown={countdown} />}

            <FormTextField
                name="utorid"
                label="UTORid"
                placeholder="lawmelon"
                register={register}
                error={errors.utorid}
            />

            <FormTextField
                name="name"
                label="Name"
                placeholder="Maso"
                disabled={loading}
                register={register}
                error={errors.name}
            />

            <FormTextField
                name="email"
                label="Email"
                type="email"
                placeholder="maso@mail.utoronto.ca"
                register={register}
                error={errors.email}
            />

            <Field>
                <Button type="submit" disabled={loading}>
                    {loading ? "Creating user..." : "Create user"}
                </Button>
            </Field>
        </form>
    )
}
