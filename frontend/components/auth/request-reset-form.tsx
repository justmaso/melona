import { Button } from "@/components/ui/button"
import { FieldGroup, Field, FieldDescription } from "@/components/ui/field"
import { FormWrapper } from "@/components/forms/form-wrapper"
import { FormField } from "@/components/forms/form-field"
import { FormMessage } from "@/components/forms/form-message"

export function RequestResetForm({
    loading = false,
    error,
    success,
    register,
    errors,
    ...props
}: React.ComponentProps<"form"> & {
    loading?: boolean
    error?: string | null
    success?: string | null
    register: any
    errors: any
}) {
    return (
        <FormWrapper
            title="Reset your password"
            description="Enter your UTORid below to reset your password"
            {...props}
        >
            <FieldGroup>
                {error && <FormMessage type="error" message={error} />}
                {success && <FormMessage type="success" message={success} />}

                <FormField
                    name="utorid"
                    label="UTORid"
                    placeholder="lawmaso"
                    disabled={loading}
                    register={register}
                    error={errors.utorid}
                />

                <Field>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Processing reset..." : "Request reset"}
                    </Button>
                </Field>

                <Field>
                    <FieldDescription className="text-center">
                        Remember your password?{" "}
                        <a href="/login" className="underline underline-offset-4">
                            Login
                        </a>
                    </FieldDescription>
                </Field>
            </FieldGroup>
        </FormWrapper>
    )
}
