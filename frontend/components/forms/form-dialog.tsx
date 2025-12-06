"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Control, FieldValues, UseFormHandleSubmit, UseFormRegister, UseFormReset } from "react-hook-form"

interface FormDialogProps<T extends FieldValues> {
    // Dialog configuration
    trigger: React.ReactNode
    title: string
    description: string
    successMessage: string
    
    // Form handling
    onSubmit: (values: T) => Promise<void>
    register: UseFormRegister<T>
    control: Control<T>
    handleSubmit: UseFormHandleSubmit<T>
    errors: any
    reset: UseFormReset<T>
    
    // Form component
    formComponent: React.ComponentType<{
        onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
        loading: boolean
        error: string | null
        success: string | null
        countdown: number | null
        register: UseFormRegister<T>
        control: Control<T>
        errors: any
        [key: string]: any
    }>
    
    // Optional props
    formProps?: Record<string, any>
    onSuccess?: () => void
    shouldRefresh?: boolean
    resetOnOpen?: boolean
    defaultValues?: Partial<T>
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function FormDialog<T extends FieldValues>({
    trigger,
    title,
    description,
    successMessage,
    onSubmit,
    register,
    control,
    handleSubmit,
    errors,
    reset,
    formComponent: FormComponent,
    formProps = {},
    onSuccess,
    shouldRefresh = false,
    resetOnOpen = true,
    defaultValues,
    open: controlledOpen,
    onOpenChange: onControlledOpenChange
}: FormDialogProps<T>) {
    const [internalOpen, setInternalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [countdown, setCountdown] = useState<number | null>(null)
    
    const router = useRouter()

    // Determine if dialog is controlled or uncontrolled
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen

    const setOpen = (newOpen: boolean) => {
        if (isControlled) {
            onControlledOpenChange?.(newOpen)
        } else {
            setInternalOpen(newOpen)
        }
    }

    // countdown timer effect
    useEffect(() => {
        if (countdown == null) return

        if (countdown === 0) {
            setOpen(false)
            setLoading(false)
            setSuccess(null)
            setError(null)
            setCountdown(null)
            reset()
            
            if (shouldRefresh) {
                router.refresh()
            }
            
            if (onSuccess) {
                onSuccess()
            }
            
            return
        }

        const timer = setTimeout(() => {
            setCountdown(countdown - 1)
        }, 1000)

        return () => clearTimeout(timer)
    }, [countdown, reset, router, shouldRefresh, onSuccess])

    // reset form when dialog opens
    useEffect(() => {
        if (open && resetOnOpen) {
            if (defaultValues) {
                reset(defaultValues as any)
            }
            setError(null)
            setSuccess(null)
        }
    }, [open, resetOnOpen, defaultValues, reset])
    
    async function handleFormSubmit(values: T) {
        setError(null)
        setSuccess(null)
        setLoading(true)

        try {
            await onSubmit(values)
            setSuccess(successMessage)
            setCountdown(3)
        } catch (err: any) {
            let errorMessage = "An error occurred"

            if (err.response?.data) {
                const data = err.response.data

                if (typeof data.error === "string") {
                    errorMessage = data.error
                } else if (typeof data.message === "string") {
                    errorMessage = data.message
                }
            }
            
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <FormComponent
                    onSubmit={handleSubmit(handleFormSubmit)}
                    loading={loading}
                    error={error}
                    success={success}
                    countdown={countdown}
                    register={register}
                    control={control}
                    errors={errors}
                    {...formProps}
                />
            </DialogContent>
        </Dialog>
    )
}

// "use client"

// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { useEffect, useState } from "react"
// import { useRouter } from "next/navigation"
// import { Control, FieldValues, UseFormHandleSubmit, UseFormRegister, UseFormReset } from "react-hook-form"

// interface FormDialogProps<T extends FieldValues> {
//     // Dialog configuration
//     trigger: React.ReactNode
//     title: string
//     description: string
//     successMessage: string
    
//     // Form handling
//     onSubmit: (values: T) => Promise<void>
//     register: UseFormRegister<T>
//     control: Control<T>
//     handleSubmit: UseFormHandleSubmit<T>
//     errors: any
//     reset: UseFormReset<T>
    
//     // Form component
//     formComponent: React.ComponentType<{
//         onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
//         loading: boolean
//         error: string | null
//         success: string | null
//         countdown: number | null
//         register: UseFormRegister<T>
//         control: Control<T>
//         errors: any
//         [key: string]: any
//     }>
    
//     // Optional props
//     formProps?: Record<string, any>
//     onSuccess?: () => void
//     shouldRefresh?: boolean
//     resetOnOpen?: boolean
//     defaultValues?: Partial<T>
// }

// export function FormDialog<T extends FieldValues>({
//     trigger,
//     title,
//     description,
//     successMessage,
//     onSubmit,
//     register,
//     control,
//     handleSubmit,
//     errors,
//     reset,
//     formComponent: FormComponent,
//     formProps = {},
//     onSuccess,
//     shouldRefresh = false,
//     resetOnOpen = true,
//     defaultValues
// }: FormDialogProps<T>) {
//     const [open, setOpen] = useState(false)
//     const [loading, setLoading] = useState(false)
//     const [success, setSuccess] = useState<string | null>(null)
//     const [error, setError] = useState<string | null>(null)
//     const [countdown, setCountdown] = useState<number | null>(null)
    
//     const router = useRouter()

//     // countdown timer effect
//     useEffect(() => {
//         if (countdown == null) return

//         if (countdown === 0) {
//             setOpen(false)
//             setLoading(false)
//             setSuccess(null)
//             setError(null)
//             setCountdown(null)
//             reset()
            
//             if (shouldRefresh) {
//                 router.refresh()
//             }
            
//             if (onSuccess) {
//                 onSuccess()
//             }
            
//             return
//         }

//         const timer = setTimeout(() => {
//             setCountdown(countdown - 1)
//         }, 1000)

//         return () => clearTimeout(timer)
//     }, [countdown, reset, router, shouldRefresh, onSuccess])

//     // reset form when dialog opens
//     useEffect(() => {
//         if (open && resetOnOpen) {
//             if (defaultValues) {
//                 reset(defaultValues as any)
//             }
//             setError(null)
//             setSuccess(null)
//         }
//     }, [open])
    
//     async function handleFormSubmit(values: T) {
//         setError(null)
//         setSuccess(null)
//         setLoading(true)

//         try {
//             await onSubmit(values)
//             setSuccess(successMessage)
//             setCountdown(3)
//         } catch (err: any) {
//             let errorMessage = "An error occurred"

//             if (err.response?.data) {
//                 // grab response data
//                 const data = err.response.data

//                 // check backend response for error message
//                 if (typeof data.error === "string") {
//                     errorMessage = data.error
//                 } else if (typeof data.message === "string") {
//                     errorMessage = data.message
//                 }
//             }

//             // Handle both axios errors and thrown Error objects
//             // const errorMessage = 
//             //     err.message || // From our service's throw new Error()
//             //     err.response?.data?.error || // Backend format 1
//             //     err.response?.data?.message || // Backend format 2
//             //     "An error occurred"
            
//             // console.error("Form submission error:", {
//             //     message: errorMessage,
//             //     fullError: err,
//             //     response: err.response
//             // })
            
//             setError(errorMessage)
//         } finally {
//             setLoading(false)
//         }
//     }

//     // async function handleFormSubmit(values: T) {
//     //     setError(null)
//     //     setSuccess(null)
//     //     setLoading(true)

//     //     try {
//     //         await onSubmit(values)
//     //         setSuccess(successMessage)
//     //         setCountdown(3)
//     //     } catch (err: any) {
//     //         setError(
//     //             err.response?.data?.message || "An error occurred"
//     //         )
//     //     } finally {
//     //         setLoading(false)
//     //     }
//     // }

//     return (
//         <Dialog open={open} onOpenChange={setOpen}>
//             <DialogTrigger asChild>
//                 {trigger}
//             </DialogTrigger>
//             <DialogContent>
//                 <DialogHeader>
//                     <DialogTitle>{title}</DialogTitle>
//                     <DialogDescription>{description}</DialogDescription>
//                 </DialogHeader>
//                 <FormComponent
//                     onSubmit={handleSubmit(handleFormSubmit)}
//                     loading={loading}
//                     error={error}
//                     success={success}
//                     countdown={countdown}
//                     register={register}
//                     control={control}
//                     errors={errors}
//                     {...formProps}
//                 />
//             </DialogContent>
//         </Dialog>
//     )
// }

// // "use client"

// // import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// // import { useEffect, useState } from "react"
// // import { useRouter } from "next/navigation"
// // import { FieldValues, UseFormHandleSubmit, UseFormRegister, UseFormReset, UseFormSetValue } from "react-hook-form"

// // interface FormDialogProps<T extends FieldValues> {
// //     // Dialog configuration
// //     trigger: React.ReactNode
// //     title: string
// //     description: string
// //     successMessage: string
    
// //     // Form handling
// //     onSubmit: (values: T) => Promise<void>
// //     register: UseFormRegister<T>
// //     handleSubmit: UseFormHandleSubmit<T>
// //     errors: any
// //     reset: UseFormReset<T>
// //     setValue?: UseFormSetValue<T>
    
// //     // Form component
// //     formComponent: React.ComponentType<{
// //         onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
// //         loading: boolean
// //         error: string | null
// //         success: string | null
// //         countdown: number | null
// //         register: UseFormRegister<T>
// //         errors: any
// //         setValue?: UseFormSetValue<T>
// //         [key: string]: any
// //     }>
    
// //     // Optional props
// //     formProps?: Record<string, any>
// //     onSuccess?: () => void
// //     shouldRefresh?: boolean
// //     resetOnOpen?: boolean
// //     defaultValues?: Partial<T>
// // }

// // export function FormDialog<T extends FieldValues>({
// //     trigger,
// //     title,
// //     description,
// //     successMessage,
// //     onSubmit,
// //     register,
// //     handleSubmit,
// //     errors,
// //     reset,
// //     setValue,
// //     formComponent: FormComponent,
// //     formProps = {},
// //     onSuccess,
// //     shouldRefresh = false,
// //     resetOnOpen = true,
// //     defaultValues
// // }: FormDialogProps<T>) {
// //     const [open, setOpen] = useState(false)
// //     const [loading, setLoading] = useState(false)
// //     const [success, setSuccess] = useState<string | null>(null)
// //     const [error, setError] = useState<string | null>(null)
// //     const [countdown, setCountdown] = useState<number | null>(null)
    
// //     const router = useRouter()

// //     // countdown timer effect
// //     useEffect(() => {
// //         if (countdown == null) return

// //         if (countdown === 0) {
// //             setOpen(false)
// //             setLoading(false)
// //             setSuccess(null)
// //             setError(null)
// //             setCountdown(null)
// //             reset()
            
// //             if (shouldRefresh) {
// //                 router.refresh()
// //             }
            
// //             if (onSuccess) {
// //                 onSuccess()
// //             }
            
// //             return
// //         }

// //         const timer = setTimeout(() => {
// //             setCountdown(countdown - 1)
// //         }, 1000)

// //         return () => clearTimeout(timer)
// //     }, [countdown, reset, router, shouldRefresh, onSuccess])

// //     // reset form when dialog opens
// //     useEffect(() => {
// //         if (open && resetOnOpen) {
// //             if (defaultValues) {
// //                 reset(defaultValues as any)
// //             }
// //             setError(null)
// //             setSuccess(null)
// //         }
// //     }, [open])
    
// //     async function handleFormSubmit(values: T) {
// //         setError(null)
// //         setSuccess(null)
// //         setLoading(true)

// //         try {
// //             await onSubmit(values)
// //             // setSuccess("Action completed successfully")
// //             setSuccess(successMessage)
// //             setCountdown(3)
// //         } catch (err: any) {
// //             setError(
// //                 err.response?.data?.message || "An error occurred"
// //             )
// //         } finally {
// //             setLoading(false)
// //         }
// //     }

// //     return (
// //         <Dialog open={open} onOpenChange={setOpen}>
// //             <DialogTrigger asChild>
// //                 {trigger}
// //             </DialogTrigger>
// //             <DialogContent>
// //                 <DialogHeader>
// //                     <DialogTitle>{title}</DialogTitle>
// //                     <DialogDescription>{description}</DialogDescription>
// //                 </DialogHeader>
// //                 <FormComponent
// //                     onSubmit={handleSubmit(handleFormSubmit)}
// //                     loading={loading}
// //                     error={error}
// //                     success={success}
// //                     countdown={countdown}
// //                     register={register}
// //                     errors={errors}
// //                     setValue={setValue}
// //                     {...formProps}
// //                 />
// //             </DialogContent>
// //         </Dialog>
// //     )
// // }
