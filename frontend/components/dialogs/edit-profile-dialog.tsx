import { UpdateProfileInput, UpdateProfileSchema } from "@/lib/validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { FormDialog } from "../forms/form-dialog"
import { Button } from "../ui/button"
import { UserService } from "@/lib/services/user"
import { EditProfileForm } from "../users/edit-profile-form"
import { useAuth } from "@/lib/auth"
import { useEffect } from "react"

interface EditProfileDialogProps {
    trigger?: React.ReactNode
}

export function EditProfileDialog({
    trigger = <Button variant="outline">Edit profile</Button>
}: EditProfileDialogProps) {
    const { user, updateUser } = useAuth()

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<UpdateProfileInput>({
        resolver: zodResolver(UpdateProfileSchema),
        defaultValues: {
            name: user?.name || "",
            email: user?.email || "",
            birthday: user?.birthday ? user.birthday.slice(0, 10) : ""
        }
    })

    useEffect(() => {
        if (user) {
            reset({
                name: user.name,
                email: user.email,
                // birthday: user.birthday
                birthday: user.birthday
                    ? user.birthday.slice(0, 10)
                    : ""  
            })
        }
    }, [user, reset])

    return (
        <div className="flex justify-end mb-3">
            <FormDialog
                trigger={trigger}
                title="Edit profile"
                description="Edit your profile below. Click save when you're done"
                successMessage="Updated profile successfully"
                onSubmit={async (values) => {
                    await UserService.updateMe(values)
                    updateUser({ ...user!, ...values })
                }}
                register={register}
                control={control}
                handleSubmit={handleSubmit}
                errors={errors}
                reset={reset}
                formComponent={EditProfileForm}
                shouldRefresh={true}
            />
        </div>
    )
}
