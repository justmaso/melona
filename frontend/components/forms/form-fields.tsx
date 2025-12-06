"use client"

import { Control, Controller, FieldError, UseFormRegister } from "react-hook-form"
import { Field, FieldLabel } from "../ui/field"
import { Input } from "../ui/input"
import { Switch } from "../ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Button } from "../ui/button"
import { ChevronDownIcon } from "lucide-react"
import { Calendar } from "../ui/calendar"

// error displaying component
function FormFieldError({ error }: { error?: FieldError }) {
    if (!error) {
        return null
    }

    return (
        <p className="text-sm text-red-500">
            {error.message}
        </p>
    )
}

// text field (emails, password, text, etc.)
interface FormTextFieldProps {
    name: string
    label: string
    type?: "text" | "email" | "password" | "number"
    placeholder?: string
    disabled?: boolean
    register: UseFormRegister<any>
    error?: FieldError
    rightElement?: React.ReactNode
    step?: string | number
    min?: number
    max?: number
}

export function FormTextField({
    name,
    label,
    type = "text",
    placeholder,
    disabled,
    register,
    error,
    rightElement,
    step,
    min,
    max
}: FormTextFieldProps) {
    const registerOptions = type === "number"
        ? { valueAsNumber: true }
        : {}

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
                step={step}
                min={min}
                max={max}
                {...register(name, registerOptions)}
            />

            <FormFieldError error={error} />
        </Field>
    )
}

// birthday field
interface FormBirthdayFieldProps {
    name: string
    label?: string
    disabled: boolean
    control: Control<any>
    error?: FieldError
}

export function FormBirthdayField({
    name,
    label = "Birthday",
    disabled,
    control,
    error
}: FormBirthdayFieldProps) {
    const [open, setOpen] = useState(false)

    return (
        <Field>
            <FieldLabel>{label}</FieldLabel>
            <Controller
                name={name}
                control={control}
                render={({ field }) => {
                    let date: Date | undefined = undefined
                    if (field.value) {
                        if (field.value instanceof Date) {
                            date = field.value
                        } else if (typeof field.value === "string" && field.value.trim() !== "") {
                            // expect YYYY-MM-DD
                            const parts = field.value.split('-')
                            if (parts.length === 3) {
                                const year = parseInt(parts[0], 10)
                                const month = parseInt(parts[1], 10)
                                const day = parseInt(parts[2], 10)

                                // validate date
                                if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                                    date = new Date(year, month - 1, day)

                                    // check date is actually valid
                                    if (isNaN(date.getTime())) {
                                        date = undefined
                                    }
                                }
                            }
                        }
                    }

                    return (
                        <>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        disabled={disabled}
                                        className="w-full justify-between font-normal"
                                    >
                                        {date ? date.toISOString().split("T")[0] : "Select date"}
                                        <ChevronDownIcon className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        captionLayout="dropdown"
                                        disabled={disabled}
                                        onSelect={(date) => {
                                            if (date) {
                                                field.onChange(date.toISOString().split("T")[0])
                                                // setDate(date)
                                                setOpen(false)
                                            }
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormFieldError error={error} />
                        </>
                    )
                }}
            />
        </Field>
    )
}

// boolean switch field (verification, suspicious, etc.)
interface FormSwitchFieldProps {
    name: string
    label: string
    disabled?: boolean
    control: Control<any>
    error?: FieldError
    rightElement?: React.ReactNode
}

export function FormSwitchField({
    name,
    label,
    disabled,
    control,
    error,
    rightElement
}: FormSwitchFieldProps) {
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

            <FormFieldError error={error} />
        </Field>
    )
}

// select field (e.g., roles, event type, etc.)
interface FormSelectFieldProps {
    name: string
    label: string
    placeholder?: string
    disabled?: boolean
    control: Control<any>
    error?: FieldError
    options: { value: string; label: string }[]
    defaultValue?: string
}

export function FormSelectField({
    name,
    label,
    placeholder,
    disabled,
    control,
    error,
    options,
    defaultValue
}: FormSelectFieldProps) {
    return (
        <Field>
            <FieldLabel>{label}</FieldLabel>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <Select
                        disabled={disabled}
                        defaultValue={defaultValue}
                        value={field.value || ""}
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
            <FormFieldError error={error} />
        </Field>
    )
}