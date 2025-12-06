import { Control, UseFormRegister, useWatch } from "react-hook-form"
import { FormSelectField, FormSwitchField, FormTextField } from "../forms/form-fields"
import { Field } from "../ui/field"
import { Button } from "../ui/button"
import { FormMessage } from "../forms/form-message"

interface EditUserFormProps {
    register: UseFormRegister<any>
    control: Control<any>
    errors: any
    onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
    loading: boolean
    error: string | null
    success: string | null
    countdown: number | null
    currentRole?: string
}

export function EditUserForm({
    register,
    control,
    errors,
    onSubmit,
    loading,
    error,
    success,
    countdown,
    initialVerified,
    ...props
}: EditUserFormProps & { initialVerified?: boolean }) {
    const ROLE_OPTIONS = [
        { value: "regular", label: "Regular" },
        { value: "cashier", label: "Cashier" },
        { value: "manager", label: "Manager" },
        { value: "superuser", label: "Superuser" }
    ]

    const verified = useWatch({ control, name: "verified" })
    const switchDisabled = initialVerified
    const submitDisabled = loading || (!verified && !initialVerified)

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {error && <FormMessage type="error" message={error} />}
            {success && <FormMessage type="success" message={success} countdown={countdown} />}

            <FormTextField
                name="email"
                label="Email"
                type="email"
                register={register}
                error={errors.email}
            />

            <FormSwitchField
                name="verified"
                label="Verified"
                control={control}
                error={errors.verified}
                disabled={switchDisabled}
            />

            <FormSwitchField
                name="suspicious"
                label="Mark as suspicious"
                control={control}
                error={errors.suspicious}
            />

            <FormSelectField
                name="role"
                label="Role"
                control={control}
                options={ROLE_OPTIONS}
                error={errors.role}
            />

            <Field>
                <Button type="submit" disabled={submitDisabled}>
                    {loading ? "Updating user..." : "Update user"}
                </Button>
                {!verified && (
                    <p className="text-sm text-red-500 mt-1">
                        Verified must be set to true
                    </p>
                )}
            </Field>
        </form>
    )
}


// import { Control, UseFormRegister, useWatch } from "react-hook-form";
// import { FormSelectField, FormSwitchField, FormTextField } from "../forms/form-fields";
// import { Field } from "../ui/field";
// import { Button } from "../ui/button";
// import { FormWrapper } from "../forms/form-wrapper";
// import { FormMessage } from "../forms/form-message";

// interface EditUserFormProps {
//     register: UseFormRegister<any>
//     control: Control<any>
//     errors: any
//     onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
//     loading: boolean
//     error: string | null
//     success: string | null
//     countdown: number | null
//     currentRole?: string
// }

// export function EditUserForm({
//     register,
//     control,
//     errors,
//     onSubmit,
//     loading,
//     error,
//     success,
//     countdown,
//     initialVerified,
//     ...props
// }: EditUserFormProps & { initialVerified?: boolean }) {
//     const ROLE_OPTIONS = [
//         { value: "regular", label: "Regular" },
//         { value: "cashier", label: "Cashier" },
//         { value: "manager", label: "Manager" },
//         { value: "superuser", label: "Superuser" }
//     ]

//     const verified = useWatch({ control, name: "verified" })
//     const switchDisabled = initialVerified
//     const submitDisabled = loading || (!verified && !initialVerified)

//     return (
//         <form onSubmit={onSubmit} className="space-y-4">
//             {error && <FormMessage type="error" message={error} />}
//             {success && <FormMessage type="success" message={success} countdown={countdown} />}

//             <FormTextField
//                 name="email"
//                 label="Email"
//                 type="email"
//                 register={register}
//                 error={errors.email}
//             />

//             <FormSwitchField
//                 name="verified"
//                 label="Verified"
//                 control={control}
//                 error={errors.verified}
//                 disabled={switchDisabled}
//             />

//             <FormSwitchField
//                 name="suspicious"
//                 label="Mark as suspicious"
//                 control={control}
//                 error={errors.suspicious}
//             />

//             <FormSelectField
//                 name="role"
//                 label="Role"
//                 control={control}
//                 options={ROLE_OPTIONS}
//                 error={errors.role}
//             />

//             <Field>
//                 <Button type="submit" disabled={submitDisabled}>
//                     {loading ? "Updating user..." : "Update user"}
//                 </Button>
//                 {!verified && (
//                     <p className="text-sm text-red-500 mt-1">
//                         Verified must be set to true
//                     </p>
//                 )}
//             </Field>
//         </form>
//     )
// }
