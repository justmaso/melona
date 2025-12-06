import { CreatePromotionInput, CreatePromotionSchema } from "@/lib/validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { FormDialog } from "../forms/form-dialog"
import { Button } from "../ui/button"
import { CreatePromotionForm } from "../promotions/create-promotion-form"
import { PromotionService } from "@/lib/services/promotion"

export function CreatePromotionDialog() {
    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<CreatePromotionInput>({
        resolver: zodResolver(CreatePromotionSchema),
        defaultValues: {
            name: "",
            description: "",
            type: "one-time",
            startTime: "",
            endTime: "",
            minSpending: "",
            rate: "",
            points: ""
        }
    })

    return (
        <div className="flex justify-end mb-3">
            <FormDialog
                trigger={<Button variant="default">Create promotion</Button>}
                title="Create promotion"
                description="Fill in the details below to create a new promotion."
                successMessage="Promotion created successfully"
                onSubmit={async (values) => {
                    await PromotionService.create(values)
                }}
                register={register}
                control={control}
                handleSubmit={handleSubmit}
                errors={errors}
                reset={reset}
                formComponent={CreatePromotionForm}
                shouldRefresh={true}
            />
        </div>
    )
}
