import { cn } from "@/lib/utils"

interface FormWrapperProps extends React.ComponentProps<"form"> {
    title?: string
    description?: string
    children: React.ReactNode
    className?: string
}

export function FormWrapper({
    title,
    description,
    children,
    className,
    ...props
}: FormWrapperProps) {
    return (
        <form className={cn("flex flex-col gap-4", className)} {...props}>
            {(title || description) && (
                <div className="flex flex-col items-center gap-1 text-center">
                    {title && (
                        <h2 className="text-lg font-semibold">{title}</h2>
                    )}
                    {description && (
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            )}
            {children}
        </form>
    )
}

// import { cn } from "@/lib/utils"

// interface FormWrapperProps extends React.ComponentProps<"form"> {
//     title?: string
//     description?: string
//     children: React.ReactNode
//     className?: string
// }

// export function FormWrapper({
//     title,
//     description,
//     children,
//     className,
//     ...props
// }: FormWrapperProps) {
//     const {
//         setValue,
//         currentRole, 
//         register, 
//         errors, 
//         loading, 
//         error, 
//         success, 
//         countdown,
//         ...formProps
//     } = props as any

//     return (
//         <form className={cn("flex flex-col gap-6", className)} {...formProps}>
//             {(title || description) && (
//                 <div className="flex flex-col items-center gap-1 text-center">
//                     {title && <h1 className="text-2xl font-bold">{title}</h1>}
//                     {description && (
//                         <p className="text-muted-foreground text-sm">{description}</p>
//                     )}
//                 </div>
//             )}
//             {children}
//         </form>
//     )
// }