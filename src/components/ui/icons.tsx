import type { ReactNode } from "react";

/** Base de los íconos: trazo con `currentColor`, así heredan el color del botón y del tema. */
function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function PlusIcon() {
  return (
    <Icon>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

/** Foto: marco, sol y montaña. */
export function ImageIcon() {
  return (
    <Icon>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-4-4L6 21" />
    </Icon>
  );
}

/** Foto nueva: el mismo marco con un "+" en la esquina. */
export function ImagePlusIcon() {
  return (
    <Icon>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-4-4L6 21" />
      <path d="M16 5h6M19 2v6" />
    </Icon>
  );
}

/** Historial: reloj con la flecha de "volver atrás". */
export function HistoryIcon() {
  return (
    <Icon>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l3 2" />
    </Icon>
  );
}
