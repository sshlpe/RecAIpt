"use client";

import { useState } from "react";
import type { AmountFormatter } from "@/lib/receipt/describe-verification";
import { TIP_PERCENT_PRESETS, type TipChoice } from "@/lib/receipt/tip";
import { CustomTipInput } from "./custom-tip-input";
import { SegmentedToggle } from "./ui/segmented-toggle";

type TipOption = "none" | `${(typeof TIP_PERCENT_PRESETS)[number]}` | "custom";

const TIP_OPTIONS: { value: TipOption; label: string }[] = [
  { value: "none", label: "Sin propina" },
  ...TIP_PERCENT_PRESETS.map((percent) => ({
    value: `${percent}` as TipOption,
    label: `${percent}%`,
  })),
  { value: "custom", label: "Otro" },
];

interface TipSelectorProps {
  /** Propina escrita en la boleta; si existe, no se ofrece agregar otra. */
  printedTip: number | null;
  addedTip: TipChoice | null;
  /** Monto de propina que se está cobrando. */
  tipAmount: number;
  /** Consumo menos descuentos: sobre esto se calculan los porcentajes. */
  tipBase: number;
  currency: string;
  formatAmount: AmountFormatter;
  onChange: (tip: TipChoice | null) => void;
}

function isPreset(tip: TipChoice | null): boolean {
  return (
    tip?.kind === "percent" && (TIP_PERCENT_PRESETS as readonly number[]).includes(tip.percent)
  );
}

/** Opción que corresponde a una propina: un porcentaje que no es preset es "Otro". */
function toOption(tip: TipChoice | null): TipOption {
  if (!tip) return "none";
  return isPreset(tip) && tip.kind === "percent" ? (`${tip.percent}` as TipOption) : "custom";
}

/** Propina: la de la boleta si viene escrita; si no, sin propina, 10%, 15% u otro valor. */
export function TipSelector(props: TipSelectorProps) {
  const { printedTip, addedTip, tipAmount, tipBase, currency, formatAmount, onChange } = props;
  // "Otro" recién elegido todavía no tiene valor, pero el campo debe verse igual.
  const [isCustom, setIsCustom] = useState(() => toOption(addedTip) === "custom");

  if (printedTip !== null) {
    return <p className="text-lg">Propina escrita en la boleta: {formatAmount(printedTip)}</p>;
  }

  function handleSelect(option: TipOption) {
    setIsCustom(option === "custom");
    if (option === "none") onChange(null);
    else if (option !== "custom") onChange({ kind: "percent", percent: Number(option) });
    else onChange({ kind: "percent", percent: 0 });
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-extrabold">Propina</h2>
      <SegmentedToggle
        ariaLabel="Propina"
        options={TIP_OPTIONS}
        selected={isCustom ? "custom" : toOption(addedTip)}
        onSelect={handleSelect}
      />
      {isCustom ? (
        <CustomTipInput
          initial={addedTip}
          base={tipBase}
          currency={currency}
          formatAmount={formatAmount}
          onChange={onChange}
        />
      ) : (
        tipAmount > 0 && <p className="text-base text-muted">Se suma {formatAmount(tipAmount)}.</p>
      )}
    </section>
  );
}
