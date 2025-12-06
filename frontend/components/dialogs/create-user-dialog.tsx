import { CreateUserInput, CreateUserSchema } from "@/lib/validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { FormDialog } from "../forms/form-dialog"
import { Button } from "../ui/button"
import { CreateUserForm } from "../users/create-user-form"
import { UserService } from "@/lib/services/user"

export function CreateUserDialog({
    onUserCreated
}: {
    onUserCreated?: () => void
}) {
    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<CreateUserInput>({
        resolver: zodResolver(CreateUserSchema)
    })

    return (
        <div className="flex justify-end mb-3">
            <FormDialog
                trigger={<Button variant="default">Create user</Button>}
                title="Create user"
                description="Create a new user below. Click create when you're done"
                successMessage="User created successfully"
                onSubmit={async (values) => {
                    await UserService.create(values)
                    onUserCreated?.()
                }}
                register={register}
                control={control}
                handleSubmit={handleSubmit}
                errors={errors}
                reset={reset}
                formComponent={CreateUserForm}
                shouldRefresh={true}
            />
        </div>
    )
}
