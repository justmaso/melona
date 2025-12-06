interface FormMessageProps {
    type: "error" | "success"
    message: string
    countdown?: number | null
}

export function FormMessage({ type, message, countdown }: FormMessageProps) {
    const isError = type === "error"
    
    return (
        <div className={`text-sm p-2 rounded-md text-center ${
            isError 
                ? "text-red-500 bg-red-100" 
                : "text-green-600 bg-green-100"
        }`}>
            <p className="font-medium">{message}</p>
            {countdown !== null && countdown !== undefined && (
                <p className="mt-1 text-xs">
                    {isError ? "Redirecting" : "Closing"} in {countdown} second{countdown !== 1 ? 's' : ''}...
                </p>
            )}
        </div>
    )
}
