"use client";

import { useState } from "react";
import type { AmountFormatter } from "@/lib/receipt/describe-verification";
import { NO_TIP, TIP_PERCENT_PRESETS, type TipChoice } from "@/lib/receipt/tip";
import { CustomTipInput } from "./custom-tip-input";
import { SegmentedToggle } from "./ui/segmented-toggle";

type PresetOption = `${(typeof TIP_PERCENT_PRESETS)[number]}`;
type TipOption = "printed" | "none" | PresetOption | "custom";

const PRESET_OPTIONS = TIP_PERCENT_PRESETS.map((percent) => ({
  value: `${percent}` as PresetOption,
  label: `${percent}%`,
}));

/** "Sugerida" solo existe si la boleta trae propina escrita. */
function buildOptions(hasPrintedTip: boolean): { value: TipOption; label: string }[] {
  return [
    ...(hasPrintedTip ? [{ value: "printed" as const, label: "Sugerida" }] : []),
    { value: "none", label: "Sin propina" },
    ...PRESET_OPTIONS,
    { value: "custom", label: "Otro" },
  ];
}

interface TipSelectorProps {
  /** Propina escrita en la boleta (sugerida o incluida), o null. */
  printedTip: number | null;
  /** Propina elegida por el usuario; null = la de la boleta (o ninguna si no trae). */
  addedTip: TipChoice | null;
  /** Monto de propina que se está cobrando. */
  tipAmount: number;
  /** Consumo antes del descuento: sobre esto se calculan los porcentajes. */
  tipBase: number;
  /** Con descuento se aclara la base, porque no coincide con el total de la boleta. */
  hasDiscount: boolean;
  currency: string;
  formatAmount: AmountFormatter;
  onChange: (tip: TipChoice | null) => void;
}

function isPreset(tip: TipChoice): tip is { kind: "percent"; percent: number } {
  return tip.kind === "percent" && (TIP_PERCENT_PRESETS as readonly number[]).includes(tip.percent);
}

function toOption(tip: TipChoice | null, hasPrintedTip: boolean): TipOption {
  if (!tip) return hasPrintedTip ? "printed" : "none";
  if (tip.kind === "amount" && tip.amount === 0) return "none";
  return isPreset(tip) ? (`${tip.percent}` as PresetOption) : "custom";
}

/**
 * Propina a pagar. Si la boleta trae una, se usa por defecto ("Sugerida"), pero se puede cambiar:
 * por si la IA la leyó mal o se quiere dar otra. "Otro" parte con el monto sugerido para editarlo.
 */
export function TipSelector(props: TipSelectorProps) {
  const {
    printedTip,
    addedTip,
    tipAmount,
    tipBase,
    hasDiscount,
    currency,
    formatAmount,
    onChange,
  } = props;
  const hasPrintedTip = printedTip !== null;
  const customStart: TipChoice = hasPrintedTip
    ? { kind: "amount", amount: printedTip }
    : { kind: "percent", percent: 0 };
  // "Otro" recién elegido puede no tener valor todavía, pero el campo debe verse igual.
  const [isCustom, setIsCustom] = useState(() => toOption(addedTip, hasPrintedTip) === "custom");

  function handleSelect(option: TipOption) {
    setIsCustom(option === "custom");
    if (option === "printed") onChange(null);
    else if (option === "none") onChange(hasPrintedTip ? NO_TIP : null);
    else if (option === "custom") onChange(customStart);
    else onChange({ kind: "percent", percent: Number(option) });
  }

  const selected = isCustom ? "custom" : toOption(addedTip, hasPrintedTip);
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-extrabold">Propina</h2>
      <SegmentedToggle
        ariaLabel="Propina"
        options={buildOptions(hasPrintedTip)}
        selected={selected}
        onSelect={handleSelect}
      />
      {isCustom && (
        <CustomTipInput
          initial={addedTip ?? customStart}
          base={tipBase}
          currency={currency}
          formatAmount={formatAmount}
          onChange={onChange}
        />
      )}
      {!isCustom && tipAmount > 0 && (
        <p className="text-base text-muted">
          {selected === "printed" ? "Propina sugerida en la boleta" : "Se suma"}:{" "}
          {formatAmount(tipAmount)}.
          {selected === "printed" && " Si se leyó mal, elige Otro y corrígela."}
        </p>
      )}
      {hasDiscount && (tipAmount > 0 || isCustom) && (
        <p className="text-base text-muted">
          Los porcentajes se calculan sobre el consumo antes del descuento ({formatAmount(tipBase)}
          ), como lo hacen los locales.
        </p>
      )}
    </section>
  );
}
