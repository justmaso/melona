import { Control, Controller, FieldError, UseFormRegister, UseFormSetValue } from "react-hook-form"
import { Field, FieldLabel } from "../ui/field"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Switch } from "../ui/switch"

interface FormFieldProps {
    name: string
    label: string
    type?: "text" | "email" | "password" | "boolean" | "select"
    placeholder?: string
    disabled?: boolean
    register?: UseFormRegister<any>
    control?: Control<any>
    error?: FieldError
    rightElement?: React.ReactNode
    options?: { value: string; label: string }[]
    defaultValue?: string
}

export function FormField({
    name,
    label,
    type = "text",
    placeholder,
    disabled,
    register,
    control,
    error,
    rightElement,
    options = [],
    defaultValue
}: FormFieldProps) {
    if (type === "boolean") {
        if (!control) {
            throw new Error(`FormField ${name} needs a a control prop`)
        }

        return (
            <Field>
                <Controller
                    name={name}
                    control={control}
                    render={({ field }) => (
                        <div className="flex items-center space-x-2">
                            <FieldLabel htmlFor={name} className="!mt-0">
                                {label}
                            </FieldLabel>
    
                            <Switch
                                checked={!!field.value}
                                disabled={disabled}
                                onCheckedChange={field.onChange}
                            />
                            {rightElement}
                        </div>
                    )}
                />

                {error && (
                    <p className="text-sm text-red-500 mt-1">{error.message}</p>
                )}
            </Field>
        )
    }

    if (type == "select") {
        if (!control) {
            throw new Error(`FormField ${name} needs a a control prop`)
        }

        return (
            <Field>
                <Controller
                    name={name}
                    control={control}
                    render={({ field }) => (
                        <Select
                            disabled={disabled}
                            defaultValue={defaultValue}
                            value={field.value}
                            onValueChange={field.onChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
                            </SelectTrigger>
                            <SelectContent>
                                {options.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {error && (
                    <p className="text-sm text-red-500 mt-1">{error.message}</p>
                )}
            </Field>
        )
    }

    return (
        <Field>
            <div className="flex items-center">
                <FieldLabel htmlFor={name}>{label}</FieldLabel>
                {rightElement}
            </div>

            <Input
                id={name}
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                // {...register(name)}
                {...(register ? register(name) : {})}
            />
            {error && (
                <p className="text-xs text-red-500">{error.message}</p>
            )}
        </Field>
    )
}