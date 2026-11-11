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

/**
 * Columnas según cuántas opciones hay. Con 4, si no caben en una fila se reparten 2 × 2 (no
 * 3 + 1 suelta). La container query se mide en rem: sigue la letra grande del teléfono.
 */
function gridColumnsClass(optionCount: number): string {
  if (optionCount === 4) return "grid-cols-2 @sm:grid-cols-4";
  // Se reparte en columnas iguales y pasa a otra fila si no caben (ej: 5 opciones).
  return "grid-cols-[repeat(auto-fit,minmax(5.5rem,1fr))]";
}

/** Selector de opciones exclusivas con botones grandes. */
export function SegmentedToggle<T extends string>({
  options,
  selected,
  onSelect,
  ariaLabel,
}: SegmentedToggleProps<T>) {
  return (
    <div className="@container">
      <div
        role="group"
        aria-label={ariaLabel}
        className={`grid ${gridColumnsClass(options.length)} gap-2 rounded-2xl bg-surface p-1`}
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
    </div>
  );
}
