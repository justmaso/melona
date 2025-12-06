import { Button } from "@/components/ui/button"
import { FieldGroup, Field, FieldDescription } from "@/components/ui/field"
import { FormWrapper } from "@/components/forms/form-wrapper"
import { FormField } from "@/components/forms/form-field"
import { FormMessage } from "@/components/forms/form-message"

export function ResetPasswordForm({
    loading = false,
    error,
    success,
    countdown,
    register,
    errors,
    ...props
}: React.ComponentProps<"form"> & {
    loading?: boolean
    error?: string | null
    success?: string | null
    countdown?: number | null
    register: any
    errors: any
}) {
    return (
        <FormWrapper
            title="Set new password"
            description="Enter your new password below"
            {...props}
        >
            <FieldGroup>
                {error && <FormMessage type="error" message={error} />}
                {success && (
                    <FormMessage 
                        type="success" 
                        message={success} 
                        countdown={countdown} 
                    />
                )}

                <FormField
                    name="password"
                    label="New password"
                    type="password"
                    disabled={loading}
                    register={register}
                    error={errors.password}
                />

                <FormField
                    name="confirmPassword"
                    label="Confirm password"
                    type="password"
                    disabled={loading}
                    register={register}
                    error={errors.confirmPassword}
                />

                <Field>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Resetting..." : "Reset password"}
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
