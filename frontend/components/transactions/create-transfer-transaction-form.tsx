import { Control, UseFormRegister } from "react-hook-form"
import { FormTextField } from "../forms/form-fields"
import { Button } from "../ui/button"
import { Field } from "../ui/field"
import { FormMessage } from "../forms/form-message"
import { NumericFormat } from "react-number-format"
import { useAuth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Zap } from "lucide-react"

interface CreateTransferTransactionFormProps {
    register: UseFormRegister<any>
    control: Control<any>
    errors: any
    onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
    loading: boolean
    error: string | null
    success: string | null
    countdown: number | null
}

export function CreateTransferTransactionForm({
    register,
    errors,
    onSubmit,
    loading,
    error,
    success,
    countdown
}: CreateTransferTransactionFormProps) {
    const { user } = useAuth()

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {error && <FormMessage type="error" message={error} />}
            {success && <FormMessage type="success" message={success} countdown={countdown} />}

            <input type="hidden" {...register("type")} value="transfer" />

            <Card className="bg-gradient-to-r from-sky-400 to-indigo-500 text-white shadow-lg border-0">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Points Balance
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    {/* <div className="text-5xl font-extrabold">{user.points || 0}</div> */}
                    <div className="text-5xl font-extrabold">
                        <NumericFormat
                            value={user?.points || 0}
                            thousandSeparator=","
                            displayType="text"    
                        />
                    </div>
                    <p className="text-sm text-blue-100">Your available points</p>
                    {/* <Button asChild variant="secondary" className="mt-2 w-full">
                        <Link href="/dashboard/points">View Points</Link>
                    </Button> */}
                </CardContent>
            </Card>

            <FormTextField
                name="recipientUtorid"
                label="Recipient UTORid"
                placeholder="lawmelon"
                disabled={loading}
                register={register}
                error={errors.recipientUtorid}
            />

            <FormTextField
                name="amount"
                label="Points to Transfer"
                type="number"
                step={1}
                placeholder="100"
                disabled={loading}
                register={register}
                error={errors.amount}
            />

            <FormTextField
                name="remark"
                label="Remark (optional)"
                placeholder="Reason for transfer"
                disabled={loading}
                register={register}
                error={errors.remark}
            />

            <Field>
                <Button type="submit" disabled={loading}>
                    {loading ? "Transferring..." : "Transfer points"}
                </Button>
            </Field>
        </form>
    )
}