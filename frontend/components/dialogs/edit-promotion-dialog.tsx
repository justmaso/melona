import { UpdatePromotionInput, UpdatePromotionSchema } from "@/lib/validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { FormDialog } from "../forms/form-dialog"
import { Button } from "../ui/button"
import { EditPromotionForm } from "../promotions/edit-promotion-form"
import { PromotionService } from "@/lib/services/promotion"
import { Promotion } from "@/models"
import { useEffect } from "react"

interface EditPromotionDialogProps {
    promotion: Promotion,
    onSuccess?: (updatedPromotion: Promotion) => void
    trigger?: React.ReactNode
}

export function EditPromotionDialog({
    promotion,
    onSuccess,
    trigger
}: EditPromotionDialogProps) {
    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<UpdatePromotionInput>({
        resolver: zodResolver(UpdatePromotionSchema),
        defaultValues: {
            name: promotion.name,
            description: promotion.description,
            type: promotion.type === "one-time" ? "one-time" : "automatic",
            startTime: promotion.startTime ? new Date(promotion.startTime).toISOString().split("T")[0] : "",
            endTime: promotion.endTime ? new Date(promotion.endTime).toISOString().split("T")[0] : "",
            minSpending: promotion.minSpending?.toString() || "",
            rate: promotion.rate?.toString() || "",
            points: promotion.points?.toString() || ""
        }
    })

    // reset form when it changes
    useEffect(() => {
        reset({
            name: promotion.name,
            description: promotion.description,
            type: promotion.type === "one-time" ? "one-time" : "automatic",
            startTime: promotion.startTime ? new Date(promotion.startTime).toISOString().split("T")[0] : "",
            endTime: promotion.endTime ? new Date(promotion.endTime).toISOString().split("T")[0] : "",
            minSpending: promotion.minSpending?.toString() || "",
            rate: promotion.rate?.toString() || "",
            points: promotion.points?.toString() || ""
        })
    }, [promotion, reset])

    return (
        <FormDialog
            trigger={trigger || <Button variant="default">Edit promotion</Button>}
            title="Edit promotion"
            description="Update the promotion details below."
            successMessage="Promotion updated successfully"
            onSubmit={async (values) => {
                const updatedPromotion = await PromotionService.update(promotion.id, values)

                // update state when updating so we don't have to refetch from API
                if (onSuccess) {
                    onSuccess(updatedPromotion)
                }
            }}
            register={register}
            control={control}
            handleSubmit={handleSubmit}
            errors={errors}
            reset={reset}
            formComponent={EditPromotionForm}
            shouldRefresh={true}
            resetOnOpen={false}
        />
    )
}