interface ToggleOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedToggleProps<T extends string> {
  options: ToggleOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
  ariaLabel: string;
}

/** Selector de opciones exclusivas con botones grandes. */
export function SegmentedToggle<T extends string>({
  options,
  selected,
  onSelect,
  ariaLabel,
}: SegmentedToggleProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="grid grid-flow-col gap-2 rounded-2xl bg-surface p-1"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === selected}
          onClick={() => onSelect(option.value)}
          className={`min-h-12 rounded-xl px-3 text-base font-bold cursor-pointer ${
            option.value === selected ? "bg-foreground text-background" : "text-foreground"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
