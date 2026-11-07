import type { ReactNode } from "react";

interface CheckboxRowProps {
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}

/** Casilla con su texto; toda la fila es tocable (área mínima de 44 px). */
export function CheckboxRow({ checked, onChange, children }: CheckboxRowProps) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-base">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-6 w-6 shrink-0 accent-[var(--accent)]"
      />
      <span className="min-w-0 break-words">{children}</span>
    </label>
  );
}
