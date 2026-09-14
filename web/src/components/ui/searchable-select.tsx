import * as React from "react"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge, type badgeVariants } from "@/components/ui/badge"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { VariantProps } from "class-variance-authority"

export interface SearchableSelectOption {
  value: string
  label: string
  /** Extra text (model id, aliases, tags) folded into the search match alongside the label. */
  keywords?: string
  /** Short trailing tag, e.g. a size ("82 MB") or status ("Loaded", "Not downloaded"). */
  badge?: string
  badgeVariant?: VariantProps<typeof badgeVariants>["variant"]
}

export interface SearchableSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: SearchableSelectOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  triggerTestId?: string
  className?: string
  disabled?: boolean
  id?: string
  /** Skip the badge on the collapsed trigger (keep it only in the option list) — for narrow selects where a long status tag would crowd or wrap. */
  hideTriggerBadge?: boolean
}

/**
 * A `Select` that can also be searched — same trigger/popup styling as
 * `Select`, but the popup is a `Command` list with a search box, and each
 * option can carry a trailing status/size `Badge`. Built for dropdowns with
 * enough options (or informative-enough metadata) that scanning a plain list
 * isn't enough: model pickers, engine/voice pickers, etc.
 */
export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No matches.",
  triggerTestId,
  className,
  disabled,
  id,
  hideTriggerBadge,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const selected = options.find((o) => o.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          data-slot="searchable-select-trigger"
          data-testid={triggerTestId}
          disabled={disabled}
          aria-expanded={open}
          className={cn(
            "border-input data-[placeholder]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full items-center justify-between gap-2 rounded-none border bg-transparent px-2.5 py-1.5 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          <span className="flex min-w-0 flex-1 items-center gap-2 truncate text-left">
            {selected ? selected.label : <span className="text-muted-foreground">{placeholder}</span>}
            {!hideTriggerBadge && selected?.badge && (
              <Badge variant={selected.badgeVariant ?? "outline"} className="shrink-0" aria-hidden="true">
                {selected.badge}
              </Badge>
            )}
          </span>
          <ChevronDownIcon className="size-4 shrink-0 opacity-50" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} data-testid={triggerTestId ? `${triggerTestId}-search` : undefined} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.keywords ?? ""}`}
                  data-testid={triggerTestId ? `${triggerTestId}-option-${option.value}` : undefined}
                  onSelect={() => {
                    onValueChange(option.value)
                    setOpen(false)
                  }}
                >
                  <CheckIcon
                    className={cn("size-4", option.value === value ? "opacity-100" : "opacity-0")}
                    aria-hidden="true"
                  />
                  <span className="flex-1 truncate">{option.label}</span>
                  {option.badge && (
                    <Badge
                      variant={option.badgeVariant ?? "outline"}
                      className="ml-auto shrink-0"
                      aria-hidden="true"
                    >
                      {option.badge}
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
