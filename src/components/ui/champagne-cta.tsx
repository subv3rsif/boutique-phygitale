"use client"

import { cn } from "@/lib/utils"
import { ArrowRight, Sparkles } from "lucide-react"
import { ButtonHTMLAttributes, forwardRef } from "react"

/**
 * Champagne CTA Component
 *
 * Premium call-to-action button with champagne gold gradient and shimmer effect.
 * Perfect for exclusive collections, premium features, or high-value actions.
 *
 * Features:
 * - Champagne gold gradient background
 * - Shimmer animation on hover
 * - Shadow glow effect
 * - Optional icon (arrow, sparkles, or custom)
 * - Multiple size variants
 * - Smooth transitions
 *
 * Usage:
 * <ChampagneCTA>Découvrir la Collection</ChampagneCTA>
 * <ChampagneCTA size="lg" icon="sparkles">Offre Exclusive</ChampagneCTA>
 * <ChampagneCTA variant="outline">En savoir plus</ChampagneCTA>
 */

export interface ChampagneCTAProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "solid" | "outline" | "ghost"
  icon?: "arrow" | "sparkles" | "none" | React.ReactNode
  iconPosition?: "left" | "right"
  fullWidth?: boolean
  glow?: boolean
}

export const ChampagneCTA = forwardRef<HTMLButtonElement, ChampagneCTAProps>(
  (
    {
      children,
      size = "md",
      variant = "solid",
      icon = "arrow",
      iconPosition = "right",
      fullWidth = false,
      glow = true,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "px-4 py-2 text-sm rounded-lg gap-2",
      md: "px-6 py-3 text-base rounded-xl gap-2",
      lg: "px-8 py-4 text-lg rounded-2xl gap-3",
      xl: "px-10 py-5 text-xl rounded-2xl gap-3",
    }

    const iconSizes = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
      xl: "h-7 w-7",
    }

    const variantClasses = {
      solid: cn(
        "bg-gradient-champagne text-white font-semibold",
        "border border-champagne-dark/20",
        glow && "shadow-champagne-lg hover:shadow-champagne",
        "champagne-shimmer",
        "hover:scale-[1.02] active:scale-[0.98]",
        disabled && "opacity-50 cursor-not-allowed hover:scale-100"
      ),
      outline: cn(
        "bg-transparent text-champagne-dark font-semibold",
        "border-2 border-champagne",
        "hover:bg-champagne-lighter",
        "shadow-champagne-sm hover:shadow-champagne",
        "hover:scale-[1.02] active:scale-[0.98]",
        disabled && "opacity-50 cursor-not-allowed hover:scale-100 hover:bg-transparent"
      ),
      ghost: cn(
        "bg-transparent text-champagne-dark font-medium",
        "hover:bg-champagne-light",
        "hover:scale-[1.02] active:scale-[0.98]",
        disabled && "opacity-50 cursor-not-allowed hover:scale-100 hover:bg-transparent"
      ),
    }

    const renderIcon = () => {
      if (icon === "none") return null
      if (icon === "arrow") return <ArrowRight className={cn(iconSizes[size], "group-hover:translate-x-1 transition-transform")} />
      if (icon === "sparkles") return <Sparkles className={cn(iconSizes[size], "group-hover:rotate-12 transition-transform")} />
      return icon
    }

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "group relative inline-flex items-center justify-center",
          "font-sans transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-2",
          sizeClasses[size],
          variantClasses[variant],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {iconPosition === "left" && renderIcon()}
        <span>{children}</span>
        {iconPosition === "right" && renderIcon()}
      </button>
    )
  }
)

ChampagneCTA.displayName = "ChampagneCTA"

/**
 * Champagne CTA Group
 *
 * Container for multiple CTAs with proper spacing
 */
export function ChampagneCTAGroup({
  children,
  orientation = "horizontal",
  className,
}: {
  children: React.ReactNode
  orientation?: "horizontal" | "vertical"
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex",
        orientation === "horizontal" ? "flex-row gap-4" : "flex-col gap-3",
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Champagne Floating Action Button
 *
 * Fixed position FAB with champagne gold gradient
 */
export function ChampagneFAB({
  icon,
  label,
  position = "bottom-right",
  className,
  ...props
}: ChampagneCTAProps & {
  label?: string
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
}) {
  const positionClasses = {
    "bottom-right": "bottom-8 right-8",
    "bottom-left": "bottom-8 left-8",
    "top-right": "top-8 right-8",
    "top-left": "top-8 left-8",
  }

  return (
    <button
      className={cn(
        "fixed z-50 group",
        "flex items-center gap-3",
        "px-6 py-4 rounded-full",
        "bg-gradient-champagne text-white font-semibold",
        "shadow-champagne-lg hover:shadow-champagne",
        "champagne-shimmer hover-champagne-glow",
        "transition-all duration-300",
        "hover:scale-110 active:scale-95",
        positionClasses[position],
        className
      )}
      {...props}
    >
      {icon}
      {label && <span className="hidden sm:inline">{label}</span>}
    </button>
  )
}
