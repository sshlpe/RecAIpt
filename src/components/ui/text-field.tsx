import { useId, type InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

/** Campo de texto grande con su etiqueta visible. */
export function TextField({ label, hint, id, ...inputProps }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-base font-bold">
        {label}
      </label>
      <input
        id={inputId}
        className="min-h-12 w-full rounded-xl border-2 border-border bg-background px-4 text-lg"
        {...inputProps}
      />
      {hint && <p className="text-base text-muted">{hint}</p>}
    </div>
  );
}
