"use client";

import { useEffect, useState } from "react";

export type AsyncValue<T> = { status: "loading" } | { status: "ready"; value: T };

/**
 * Carga un valor asíncrono al montar y cada vez que cambia `key`. Si la carga falla, usa
 * `fallback`. Ignora respuestas que llegan después de cambiar de `key` o de desmontar.
 */
export function useAsyncValue<T>(load: () => Promise<T>, fallback: T, key: string): AsyncValue<T> {
  const [state, setState] = useState<{ key: string; value: T } | null>(null);

  useEffect(() => {
    let isActive = true;
    load()
      .catch(() => fallback)
      .then((value) => {
        if (isActive) setState({ key, value });
      });
    return () => {
      isActive = false;
    };
    // `load` y `fallback` se leen al cambiar `key`; no deben disparar recargas por sí solos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state?.key === key ? { status: "ready", value: state.value } : { status: "loading" };
}
