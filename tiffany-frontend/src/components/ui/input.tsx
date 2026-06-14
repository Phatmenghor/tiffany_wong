import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-[2.75rem] sm:h-[1.625rem] w-full rounded-[0.24375rem] border border-input bg-transparent px-[0.65rem] sm:px-[0.4875rem] py-[0.325rem] text-[12px] shadow-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-[12px] file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
