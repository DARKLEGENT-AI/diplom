"use client"

import * as React from "react"

import { cn } from "@src/shared/ui/lib/utils"

type ProgressProps = React.ComponentProps<"div"> & {
  value?: number
}

function Progress({ className, value = 0, ...props }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div
      data-slot="progress"
      className={cn(
        "relative flex h-1.5 w-full items-center overflow-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      <div
        data-slot="progress-indicator"
        className="h-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - clamped}%)` }}
      />
    </div>
  )
}

export { Progress }
