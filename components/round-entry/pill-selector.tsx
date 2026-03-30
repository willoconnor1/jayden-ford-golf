"use client";

import { cn } from "@/lib/utils";

interface PillOption<T extends string> {
  value: T;
  label: string;
}

interface PillSelectorBaseProps<T extends string> {
  options: PillOption<T>[];
  columns?: number;
  activeColor?: string;
  activeColorMap?: Partial<Record<T, string>>;
  label?: string;
  allowDeselect?: boolean;
}

interface SinglePillSelectorProps<T extends string> extends PillSelectorBaseProps<T> {
  multiSelect?: false;
  value: T | undefined;
  onChange: (value: T | undefined) => void;
}

interface MultiPillSelectorProps<T extends string> extends PillSelectorBaseProps<T> {
  multiSelect: true;
  value: T[] | undefined;
  onChange: (value: T[] | undefined) => void;
}

type PillSelectorProps<T extends string> = SinglePillSelectorProps<T> | MultiPillSelectorProps<T>;

export function PillSelector<T extends string>(props: PillSelectorProps<T>) {
  const {
    options,
    columns = 3,
    activeColor = "bg-primary",
    activeColorMap,
    label,
    allowDeselect = true,
    value,
    onChange,
  } = props;
  const multi = props.multiSelect === true;

  const isActive = (opt: T) =>
    multi
      ? Array.isArray(value) && (value as T[]).includes(opt)
      : value === opt;

  const handleClick = (opt: T) => {
    if (multi) {
      const current = Array.isArray(value) ? (value as T[]) : [];
      const onChangeMulti = onChange as (value: T[] | undefined) => void;
      if (current.includes(opt)) {
        const next = current.filter((v) => v !== opt);
        onChangeMulti(next.length > 0 ? next : undefined);
      } else {
        onChangeMulti([...current, opt]);
      }
    } else {
      const onChangeSingle = onChange as (value: T | undefined) => void;
      if (isActive(opt) && allowDeselect) {
        onChangeSingle(undefined);
      } else {
        onChangeSingle(opt);
      }
    }
  };

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
          const active = isActive(opt.value);
          const optColor = activeColorMap?.[opt.value] ?? activeColor;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleClick(opt.value)}
              className={cn(
                "px-2 py-2 text-xs font-medium rounded-lg border transition-colors text-center",
                "min-h-[36px] active:scale-95",
                active
                  ? `${optColor} text-white border-transparent`
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
