"use client";

import { useEffect, useState } from "react";

/** Segundos transcurridos desde que se montó el componente (se actualiza cada segundo). */
export function useElapsedSeconds(): number {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const interval = setInterval(
      () => setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000)),
      1000,
    );
    return () => clearInterval(interval);
  }, []);

  return elapsedSeconds;
}
