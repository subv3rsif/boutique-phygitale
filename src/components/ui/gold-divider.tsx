import { cn } from "@/lib/utils"

/**
 * Gold Divider Component
 *
 * Elegant section divider with champagne gold accents.
 * Perfect for separating premium content sections.
 *
 * Features:
 * - Horizontal gradient line (transparent → champagne → transparent)
 * - Center ornament (circle, diamond, or custom icon)
 * - Configurable spacing
 * - Subtle glow effect
 *
 * Usage:
 * <GoldDivider />
 * <GoldDivider variant="diamond" />
 * <GoldDivider spacing="lg" />
 * <GoldDivider ornament={<Star />} />
 */

interface GoldDividerProps {
  variant?: "circle" | "diamond" | "line" | "custom"
  spacing?: "sm" | "md" | "lg" | "xl"
  ornament?: React.ReactNode
  className?: string
}

export function GoldDivider({
  variant = "circle",
  spacing = "md",
  ornament,
  className,
}: GoldDividerProps) {
  const spacingClasses = {
    sm: "my-8",
    md: "my-12",
    lg: "my-16",
    xl: "my-24",
  }

  return (
    <div className={cn("relative h-px", spacingClasses[spacing], className)}>
      {/* Gradient line */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-champagne to-transparent opacity-40" />

      {/* Center ornament */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-2">
        {variant === "custom" && ornament ? (
          <div className="flex items-center justify-center h-4 w-4 text-champagne">
            {ornament}
          </div>
        ) : variant === "diamond" ? (
          <div className="h-3 w-3 rotate-45 bg-gradient-champagne shadow-champagne-sm" />
        ) : variant === "circle" ? (
          <div className="h-4 w-4 rounded-full bg-gradient-champagne shadow-champagne" />
        ) : null}
      </div>
    </div>
  )
}

/**
 * Gold Divider with Text
 *
 * Section divider with centered text label
 */
interface GoldDividerTextProps {
  text: string
  spacing?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function GoldDividerText({ text, spacing = "md", className }: GoldDividerTextProps) {
  const spacingClasses = {
    sm: "my-8",
    md: "my-12",
    lg: "my-16",
    xl: "my-24",
  }

  return (
    <div className={cn("relative", spacingClasses[spacing], className)}>
      {/* Gradient lines on both sides */}
      <div className="absolute inset-0 flex items-center">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-champagne/40 to-champagne/40" />
      </div>

      {/* Centered text */}
      <div className="relative flex justify-center">
        <span className="bg-background px-4 font-display text-sm uppercase tracking-wide text-champagne-dark">
          {text}
        </span>
      </div>
    </div>
  )
}

/**
 * Vertical Gold Divider
 *
 * For horizontal layouts (e.g., sidebar separators)
 */
interface GoldDividerVerticalProps {
  height?: string
  className?: string
}

export function GoldDividerVertical({ height = "h-24", className }: GoldDividerVerticalProps) {
  return (
    <div className={cn("relative w-px", height, className)}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-champagne to-transparent opacity-40" />
    </div>
  )
}

/**
 * Decorative Gold Pattern Divider
 *
 * More ornate divider with multiple decorative elements
 */
export function GoldDividerDecorative({ className }: { className?: string }) {
  return (
    <div className={cn("relative my-16", className)}>
      {/* Main gradient line */}
      <div className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-champagne to-transparent opacity-30" />

      {/* Center ornament group */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-4 flex items-center gap-3">
        {/* Left diamond */}
        <div className="h-2 w-2 rotate-45 bg-gradient-champagne opacity-60 shadow-champagne-sm" />

        {/* Center circle with glow */}
        <div className="relative">
          <div className="h-5 w-5 rounded-full bg-gradient-champagne shadow-champagne champagne-glow-sm" />
          <div className="absolute inset-0 rounded-full bg-champagne/20 blur-md" />
        </div>

        {/* Right diamond */}
        <div className="h-2 w-2 rotate-45 bg-gradient-champagne opacity-60 shadow-champagne-sm" />
      </div>
    </div>
  )
}
