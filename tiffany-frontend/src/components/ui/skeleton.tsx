import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-[0.24375rem] bg-primary/10", className)}
      {...props}
    />
  )
}

export { Skeleton }
