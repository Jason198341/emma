"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface PostItProps {
  children: ReactNode
  color?: "yellow" | "blue" | "green" | "pink" | "purple" | "orange" | "red"
  className?: string
  rotate?: "left" | "right" | "none"
  size?: "sm" | "md" | "lg"
  onClick?: () => void
}

export function PostIt({ children, color = "yellow", className, rotate = "none", size = "md", onClick }: PostItProps) {
  // 색상 매핑
  const colorMap = {
    yellow: "bg-amber-100 dark:bg-amber-200/90",
    blue: "bg-blue-100 dark:bg-blue-200/90",
    green: "bg-green-100 dark:bg-green-200/90",
    pink: "bg-pink-100 dark:bg-pink-200/90",
    purple: "bg-purple-100 dark:bg-purple-200/90",
    orange: "bg-orange-100 dark:bg-orange-200/90",
    red: "bg-red-100 dark:bg-red-200/90",
  }

  // 회전 매핑
  const rotateMap = {
    left: "-rotate-1",
    right: "rotate-1",
    none: "",
  }

  // 크기 매핑
  const sizeMap = {
    sm: "p-3",
    md: "p-4",
    lg: "p-5",
  }

  return (
    <div
      className={cn(
        colorMap[color],
        rotateMap[rotate],
        sizeMap[size],
        "rounded-md shadow-md relative transition-all duration-200 ease-in-out",
        "border border-gray-200 dark:border-gray-700",
        "hover:shadow-lg hover:-translate-y-1",
        "before:absolute before:w-8 before:h-3 before:bg-gray-200/50 before:dark:bg-gray-600/50 before:top-0 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-md",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

