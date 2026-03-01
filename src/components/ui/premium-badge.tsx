import { cn } from "@/lib/utils"
import { Star } from "lucide-react"

/**
 * Premium Badge Component
 *
 * Elegant badge with champagne gold accents for highlighting premium features,
 * new products, limited editions, or exclusive content.
 *
 * Features:
 * - Champagne gold border and text
 * - Cloud Dancer light background
 * - Optional star icon
 * - Small shadow for depth
 * - Responsive sizing
 *
 * Usage:
 * <PremiumBadge label="Édition Limitée" />
 * <PremiumBadge label="Nouveau" showStar />
 * <PremiumBadge label="Exclusif" variant="solid" />
 */

export interface PremiumBadgeProps {
  label: string
  showStar?: boolean
  variant?: "outlined" | "solid" | "glass"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function PremiumBadge({
  label,
  showStar = true,
  variant = "outlined",
  size = "md",
  className,
}: PremiumBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-sm gap-2",
    lg: "px-4 py-2 text-base gap-2.5",
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  }

  const variantClasses = {
    outlined:
      "bg-champagne-light border border-champagne text-champagne-dark shadow-champagne-sm",
    solid:
      "bg-gradient-champagne text-white border border-champagne-dark/20 shadow-champagne",
    glass:
      "glass-champagne border border-champagne/30 text-champagne-dark shadow-champagne-sm backdrop-blur-md",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full font-medium transition-all",
        "hover:shadow-champagne hover:scale-105",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {showStar && <Star className={cn(iconSizes[size], "text-champagne fill-champagne/20")} />}
      <span>{label}</span>
    </div>
  )
}

/**
 * Premium Badge Dot Variant
 *
 * Minimal champagne dot indicator for subtle premium marking
 */
export function PremiumDot({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative h-2 w-2 rounded-full bg-gradient-champagne shadow-champagne-sm",
        "after:absolute after:inset-0 after:rounded-full after:bg-champagne/40 after:blur-sm",
        className
      )}
    />
  )
}

/**
 * Premium Badge with Custom Icon
 */
export interface PremiumBadgeIconProps {
  label: string
  icon: React.ReactNode
  variant?: "outlined" | "solid" | "glass"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function PremiumBadgeIcon({
  label,
  icon,
  variant = "outlined",
  size = "md",
  className,
}: PremiumBadgeIconProps) {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-sm gap-2",
    lg: "px-4 py-2 text-base gap-2.5",
  }

  const variantClasses = {
    outlined:
      "bg-champagne-light border border-champagne text-champagne-dark shadow-champagne-sm",
    solid:
      "bg-gradient-champagne text-white border border-champagne-dark/20 shadow-champagne",
    glass:
      "glass-champagne border border-champagne/30 text-champagne-dark shadow-champagne-sm backdrop-blur-md",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full font-medium transition-all",
        "hover:shadow-champagne hover:scale-105",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {icon}
      <span>{label}</span>
    </div>
  )
}
