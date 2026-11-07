"use client";

import { useState } from "react";
import { getCurrencyDecimals } from "@/lib/format/currency";
import { formatPercent, parseLocaleNumber } from "@/lib/format/format-numbers";
import type { AmountFormatter } from "@/lib/receipt/describe-verification";
import { calculateTipAmount, tipPercentOf, type TipChoice } from "@/lib/receipt/tip";
import { SegmentedToggle } from "./ui/segmented-toggle";
import { TextField } from "./ui/text-field";

type TipUnit = TipChoice["kind"];

const UNIT_OPTIONS: { value: TipUnit; label: string }[] = [
  { value: "percent", label: "Porcentaje (%)" },
  { value: "amount", label: "Monto" },
];

/** Porcentajes con hasta 2 decimales ("7,5"). */
const PERCENT_DECIMALS = 2;

interface CustomTipInputProps {
  initial: TipChoice | null;
  /** Consumo menos descuentos: sobre esto se calcula el porcentaje. */
  base: number;
  currency: string;
  formatAmount: AmountFormatter;
  onChange: (tip: TipChoice) => void;
}

/** Convierte lo escrito en una propina; texto vacío o inválido cuenta como 0. */
function toChoice(unit: TipUnit, text: string, currency: string): TipChoice {
  const decimals = unit === "percent" ? PERCENT_DECIMALS : getCurrencyDecimals(currency);
  const parsed = parseLocaleNumber(text, decimals);
  const value = parsed !== null && parsed >= 0 ? parsed : 0;
  return unit === "percent"
    ? { kind: "percent", percent: value }
    : { kind: "amount", amount: value };
}

/** Explica la propina en la otra unidad: "5% del consumo = $435" o "$500 = 5,8% del consumo". */
function describeConversion(choice: TipChoice, props: CustomTipInputProps): string | null {
  const amount = calculateTipAmount(choice, props.base, props.currency);
  if (amount <= 0) return null;
  if (choice.kind === "percent") {
    return `${formatPercent(choice.percent)} del consumo = ${props.formatAmount(amount)}`;
  }
  const percent = tipPercentOf(amount, props.base);
  return percent === null
    ? null
    : `${props.formatAmount(amount)} = ${formatPercent(percent)} del consumo`;
}

/** Propina personalizada: un número en porcentaje o en monto, con la conversión a la vista. */
export function CustomTipInput(props: CustomTipInputProps) {
  const { initial, currency, onChange } = props;
  const [unit, setUnit] = useState<TipUnit>(initial?.kind ?? "percent");
  const [text, setText] = useState("");
  const conversion = describeConversion(toChoice(unit, text, currency), props);

  function update(nextUnit: TipUnit, nextText: string) {
    setUnit(nextUnit);
    setText(nextText);
    onChange(toChoice(nextUnit, nextText, currency));
  }

  return (
    <div className="space-y-3">
      <SegmentedToggle
        ariaLabel="Unidad de la propina"
        options={UNIT_OPTIONS}
        selected={unit}
        onSelect={(nextUnit) => update(nextUnit, text)}
      />
      <TextField
        label={unit === "percent" ? "Porcentaje de propina" : "Monto de la propina"}
        inputMode="decimal"
        autoFocus
        value={text}
        onChange={(event) => update(unit, event.target.value)}
      />
      {conversion && <p className="text-lg font-bold">{conversion}</p>}
    </div>
  );
}
