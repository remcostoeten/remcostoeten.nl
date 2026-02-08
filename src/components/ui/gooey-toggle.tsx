"use client"

import { memo, useState, useEffect, useCallback, type ChangeEvent, type InputHTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "relative block cursor-pointer h-8 w-[52px] transform-gpu perspective-[1000px] backface-hidden",
  {
    variants: {
      variant: {
        default: "[--toggle-bg:var(--toggle-active)]",
        success: "[--toggle-bg:var(--toggle-success)]",
        warning: "[--toggle-bg:var(--toggle-warning)]",
        danger: "[--toggle-bg:var(--toggle-danger)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

const inputStyles = cn(
  "h-full w-full cursor-pointer appearance-none rounded-full",
  "bg-toggle outline-none transition-colors duration-500",
  "hover:bg-toggle-hover transform-gpu",
  "data-[checked=true]:bg-[hsl(var(--toggle-bg))]",
)

const svgStyles = cn(
  "pointer-events-none absolute inset-0 fill-toggle-knob transform-gpu",
)

const circleStyles = cn(
  "transform-gpu transition-transform duration-500 backface-hidden",
)

const dropCircleStyles = cn(
  "transform-gpu transition-transform duration-700 backface-hidden",
)

type TProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> &
  VariantProps<typeof toggleVariants> & {
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
  }

const GooeyToggle = memo(function GooeyToggle({
  className,
  variant,
  checked = false,
  onCheckedChange,
  ref,
  ...props
}: TProps & { ref?: React.Ref<HTMLInputElement> }) {
  const [isChecked, setIsChecked] = useState(checked)

  useEffect(() => {
    setIsChecked(checked)
  }, [checked])

  const handleChange = useCallback(
    function handleChange(e: ChangeEvent<HTMLInputElement>) {
      const newValue = e.target.checked
      setIsChecked(newValue)
      onCheckedChange?.(newValue)
    },
    [onCheckedChange],
  )

  return (
    <label className={cn(toggleVariants({ variant }), className)}>
      <input
        type="checkbox"
        ref={ref}
        checked={isChecked}
        onChange={handleChange}
        data-checked={isChecked}
        className={inputStyles}
        {...props}
      />
      <svg viewBox="0 0 52 32" filter="url(#gooey-filter)" className={svgStyles}>
        <circle
          className={circleStyles}
          cx="16"
          cy="16"
          r="10"
          style={{
            transformOrigin: "16px 16px",
            transform: `translateX(${isChecked ? "12px" : "0px"}) scale(${isChecked ? "0" : "1"})`,
          }}
        />
        <circle
          className={circleStyles}
          cx="36"
          cy="16"
          r="10"
          style={{
            transformOrigin: "36px 16px",
            transform: `translateX(${isChecked ? "0px" : "-12px"}) scale(${isChecked ? "1" : "0"})`,
          }}
        />
        {isChecked && (
          <circle className={dropCircleStyles} cx="35" cy="-1" r="2.5" />
        )}
      </svg>
    </label>
  )
})

function GooeyFilter() {
  return (
    <svg className="fixed h-0 w-0" aria-hidden="true">
      <defs>
        <filter id="gooey-filter">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  )
}

export { GooeyToggle, GooeyFilter }
export type { TProps as TGooeyToggleProps }
