"use client"

import * as React from "react"

import { cn } from "@lib/utils"

type RadioGroupContextValue = {
  disabled?: boolean
  name?: string
  onValueChange: (value: string) => void
  required?: boolean
  value?: string
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null)

type RadioGroupProps = Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> & {
  defaultValue?: string
  disabled?: boolean
  name?: string
  onValueChange?: (value: string) => void
  required?: boolean
  value?: string
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      className,
      defaultValue,
      disabled,
      name,
      onValueChange,
      required,
      value: valueProp,
      ...props
    },
    ref,
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
    const isControlled = valueProp !== undefined
    const value = isControlled ? valueProp : uncontrolledValue

    const handleValueChange = React.useCallback((nextValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue)
      }
      onValueChange?.(nextValue)
    }, [isControlled, onValueChange])

    return (
      <RadioGroupContext.Provider
        value={{
          disabled,
          name,
          onValueChange: handleValueChange,
          required,
          value,
        }}
      >
        <div
          ref={ref}
          role="radiogroup"
          className={cn("grid gap-2", className)}
          {...props}
        />
      </RadioGroupContext.Provider>
    )
  },
)
RadioGroup.displayName = "RadioGroup"

type RadioGroupItemProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> & {
  value: string
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, disabled, id, onChange, value, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext)

    if (!context) {
      throw new Error("RadioGroupItem must be used within a RadioGroup")
    }

    const checked = context.value === value
    const isDisabled = context.disabled || disabled

    return (
      <input
        ref={ref}
        id={id}
        type="radio"
        name={context.name}
        value={value}
        checked={checked}
        disabled={isDisabled}
        required={context.required}
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        className={cn(
          "size-4 shrink-0 cursor-pointer appearance-none rounded-full border border-primary bg-background shadow transition-colors outline-none",
          "focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          "checked:border-primary checked:bg-primary checked:[box-shadow:inset_0_0_0_3px_hsl(var(--background))]",
          className,
        )}
        onChange={(event) => {
          if (!event.target.checked) {
            return
          }

          context.onValueChange(value)
          onChange?.(event)
        }}
        {...props}
      />
    )
  },
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
