/** Suma el valor que `selectValue` extrae de cada elemento. */
export function sumBy<T>(values: T[], selectValue: (value: T) => number): number {
  return values.reduce((total, value) => total + selectValue(value), 0);
}
