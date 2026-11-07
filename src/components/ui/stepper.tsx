import { IconButton } from "./icon-button";

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  /** Qué se cuenta, para lectores de pantalla (ej: "Coca-Cola para Papá"). */
  label: string;
  min?: number;
  max?: number;
}

/** Contador "− n +" con botones grandes. */
export function Stepper({ value, onChange, label, min = 0, max = Infinity }: StepperProps) {
  return (
    <div role="group" aria-label={label} className="flex shrink-0 items-center gap-2">
      <IconButton
        icon="−"
        label={`Uno menos: ${label}`}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      />
      <span className="min-w-8 text-center text-xl font-bold tabular-nums" aria-live="polite">
        {value}
      </span>
      <IconButton
        icon="+"
        label={`Uno más: ${label}`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      />
    </div>
  );
}
