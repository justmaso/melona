import { UpdateUserInput, UpdateUserSchema } from "@/lib/validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { FormDialog } from "../forms/form-dialog"
import { Button } from "../ui/button"
import { UserService } from "@/lib/services/user"
import { User } from "@/models"
import { EditUserForm } from "../users/edit-user-form"
import { useEffect } from "react"

interface EditUserDialogProps {
    user: User
    onSuccess?: (updatedUser: User) => void
    trigger?: React.ReactNode
}

export function EditUserDialog({
    user,
    onSuccess,
    trigger = <Button variant="default">Edit user</Button>
}: EditUserDialogProps) {
    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<UpdateUserInput>({
        resolver: zodResolver(UpdateUserSchema),
        defaultValues: {
            email: user.email,
            verified: user.verified,
            suspicious: user.suspicious,
            role: user.role
        }
    })

    useEffect(() => {
        reset({
            email: user.email,
            verified: user.verified,
            suspicious: user.suspicious,
            role: user.role
        })
    }, [user, reset])

    async function handleUpdateUser(values: UpdateUserInput) {
        const response = await UserService.update(user.id, values)

        if (onSuccess) {
            onSuccess(response.data)
        }

        reset(response.data)
    }

    return (
        <div className="flex justify-end mb-3">
            <FormDialog
                trigger={trigger}
                title="Edit user"
                description="Edit user information below. Click save when you're done"
                successMessage="Updated user successfully"
                onSubmit={handleUpdateUser}
                register={register}
                control={control}
                handleSubmit={handleSubmit}
                errors={errors}
                reset={reset}
                formComponent={EditUserForm}
                formProps={{ initialVerified: user.verified }}
            />
        </div>
    )
}


// import { UpdateUserInput, UpdateUserSchema } from "@/lib/validation"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import { FormDialog } from "../forms/form-dialog"
// import { Button } from "../ui/button"
// import { UserService } from "@/lib/services/user"
// import { User } from "@/models"
// import { EditUserForm } from "../users/edit-user-form"

// interface EditUserDialogProps {
//     user: User
//     onSuccess?: (updatedUser: User) => void
//     trigger?: React.ReactNode
// }

// export function EditUserDialog({
//     user,
//     onSuccess,
//     trigger = <Button variant="default">Edit user</Button>
// }: EditUserDialogProps) {
//     const {
//         register,
//         control,
//         handleSubmit,
//         reset,
//         formState: { errors }
//     } = useForm<UpdateUserInput>({
//         resolver: zodResolver(UpdateUserSchema),
//         defaultValues: {
//             email: user.email,
//             verified: user.verified,
//             suspicious: user.suspicious,
//             role: user.role
//         }
//     })

//     async function handleUpdateUser(values: UpdateUserInput) {
//         const response = await UserService.update(user.id, values)

//         if (onSuccess) {
//             onSuccess(response.data)
//         }

//         reset(response.data)
//     }

//     return (
//         <div className="flex justify-end mb-3">
//             <FormDialog
//                 trigger={trigger}
//                 title="Edit user"
//                 description="Edit user information below. Click save when you're done"
//                 successMessage="Updated user successfully"
//                 onSubmit={handleUpdateUser}
//                 register={register}
//                 control={control}
//                 handleSubmit={handleSubmit}
//                 errors={errors}
//                 reset={reset}
//                 formComponent={EditUserForm}
//                 defaultValues={{
//                     email: user.email,
//                     verified: user.verified,
//                     suspicious: user.suspicious,
//                     role: user.role
//                 }}
//                 formProps={{ initialVerified: user.verified }}
//             />
//         </div>
//     )
// }
