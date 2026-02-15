import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-md bg-slate-200/75",
        "before:absolute before:inset-0 before:animate-pulse",
        "before:bg-linear-to-r before:from-transparent before:via-white/70 before:to-transparent",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
