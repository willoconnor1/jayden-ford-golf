"use client"

import * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"
import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ComboboxProps {
  /** Full list of options to filter against */
  options: string[]
  /** Current selected value (controlled) */
  value: string
  /** Called when user selects an item or types a custom value */
  onValueChange: (value: string) => void
  /** Placeholder text for the input */
  placeholder?: string
  /** Whether the user can type a value not in the list */
  freeSolo?: boolean
  /** Whether the field is disabled */
  disabled?: boolean
  /** Additional className for the trigger */
  className?: string
}

function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Search...",
  freeSolo = false,
  disabled = false,
  className,
}: ComboboxProps) {
  const filter = ComboboxPrimitive.useFilter()

  const handleValueChange = (newValue: string | null) => {
    onValueChange(newValue ?? "")
  }

  const handleOpenChange = (open: boolean) => {
    // For non-freeSolo, base-ui will revert the input automatically when
    // the user hasn't selected anything. No extra handling needed.
    // For freeSolo, we commit whatever is in the input on close.
    if (!open && freeSolo) {
      // The input element holds the current typed text.
      // If the user typed something but didn't select from the list,
      // we commit that value via a small timeout to let base-ui finish.
      // We handle this in onInputValueChange instead.
    }
  }

  // Track the latest input value so we can commit freeSolo on blur
  const inputValueRef = React.useRef(value)

  const handleInputValueChange = (inputValue: string) => {
    inputValueRef.current = inputValue
    if (freeSolo) {
      // Immediately commit typed text so parent state stays in sync
      onValueChange(inputValue)
    }
  }

  return (
    <ComboboxPrimitive.Root
      value={value || null}
      onValueChange={handleValueChange}
      onOpenChange={handleOpenChange}
      onInputValueChange={handleInputValueChange}
      items={options}
      filter={(item, query) => filter.contains(item, query)}
      disabled={disabled}
    >
      <ComboboxPrimitive.Input
        placeholder={placeholder}
        className={cn(
          "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 md:text-sm dark:bg-input/30",
          className,
        )}
      />

      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner
          side="bottom"
          sideOffset={4}
          className="isolate z-50"
        >
          <ComboboxPrimitive.Popup className="max-h-64 w-(--anchor-width) overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 p-1">
            <ComboboxPrimitive.List>
              {(item: string, index: number) => (
                <ComboboxPrimitive.Item
                  key={item}
                  value={item}
                  index={index}
                  className="relative flex w-full cursor-default items-center rounded-md py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                >
                  {item}
                  <ComboboxPrimitive.ItemIndicator className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
                    <CheckIcon className="size-4" />
                  </ComboboxPrimitive.ItemIndicator>
                </ComboboxPrimitive.Item>
              )}
            </ComboboxPrimitive.List>

            <ComboboxPrimitive.Empty className="px-3 py-4 text-sm text-center text-muted-foreground">
              {freeSolo
                ? "No matches — your custom value will be used"
                : "No results found"}
            </ComboboxPrimitive.Empty>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  )
}

export { Combobox }
