"use client";

import { cn } from "@/lib/utils";

interface PillOption<T extends string> {
  value: T;
  label: string;
}

interface PillSelectorProps<T extends string> {
  options: PillOption<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
  columns?: number;
  activeColor?: string; // tailwind bg class e.g. "bg-blue-600"
  label?: string;
  allowDeselect?: boolean;
}

export function PillSelector<T extends string>({
  options,
  value,
  onChange,
  columns = 3,
  activeColor = "bg-primary",
  label,
  allowDeselect = false,
}: PillSelectorProps<T>) {
  return (
    <div className="space-y-1.5">
      {label && (
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
      )}
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                if (isActive && allowDeselect) {
                  onChange(undefined as unknown as T);
                } else {
                  onChange(opt.value);
                }
              }}
              className={cn(
                "px-2 py-2 text-xs font-medium rounded-lg border transition-colors text-center",
                "min-h-[36px] active:scale-95",
                isActive
                  ? `${activeColor} text-white border-transparent`
                  : "bg-background border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
