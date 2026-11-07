import type { ReceiptVerification } from "./verify-totals";

export type VerificationTone = "success" | "warning" | "info";

export interface VerificationMessage {
  tone: VerificationTone;
  title: string;
  details: string[];
}

/** Cómo escribir un monto: para pantalla ("$12.500") o para voz ("12500 pesos"). */
export type AmountFormatter = (amount: number) => string;

function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

function describeMismatches(verification: ReceiptVerification, format: AmountFormatter): string[] {
  const { lineMismatches, subtotalCheck, totalCheck } = verification;
  const details: string[] = [];
  if (lineMismatches.length > 0) {
    const lines = pluralize(lineMismatches.length, "línea", "líneas");
    details.push(`En ${lineMismatches.length} ${lines}, cantidad por precio no da el total.`);
  }
  if (subtotalCheck && !subtotalCheck.matches) {
    details.push(
      `Los productos suman ${format(subtotalCheck.expected)}, ` +
        `pero el subtotal dice ${format(subtotalCheck.printed)}.`,
    );
  }
  if (totalCheck && !totalCheck.matches) {
    details.push(
      `El total debería ser ${format(totalCheck.expected)}, ` +
        `pero la boleta dice ${format(totalCheck.printed)}.`,
    );
  }
  return details;
}

function describeTip(verification: ReceiptVerification): string[] {
  if (verification.tipPercentage === null) return [];
  return [`La propina es el ${verification.tipPercentage.toLocaleString("es-CL")}% de la cuenta.`];
}

function describeDoubts(verification: ReceiptVerification): string[] {
  const count = verification.doubtfulItemIndexes.length;
  if (count === 0) return [];
  const lines = pluralize(count, "línea marcada", "líneas marcadas");
  const verb = pluralize(count, "se leyó", "se leyeron");
  return [`Revisa ${count} ${lines}: no ${verb} con total seguridad.`];
}

/**
 * Mensaje de verificación para mostrar y para leer en voz alta.
 * Nunca afirma un cobro de más: una diferencia puede ser un error de lectura.
 */
export function describeVerification(
  verification: ReceiptVerification,
  itemCount: number,
  format: AmountFormatter,
): VerificationMessage {
  if (itemCount === 0) {
    return {
      tone: "info",
      title: "No encontramos productos en la foto",
      details: ["Intenta con otra foto, con buena luz y la boleta completa."],
    };
  }
  if (!verification.isConsistent) {
    return {
      tone: "warning",
      title: "La suma no cuadra",
      details: [
        ...describeMismatches(verification, format),
        ...describeDoubts(verification),
        "Puede ser un error de lectura de la foto. Compara con la boleta antes de reclamar.",
      ],
    };
  }
  if (verification.totalCheck === null) {
    return {
      tone: "info",
      title: `Los productos suman ${format(verification.itemsSum)}`,
      details: [
        "No vimos un total escrito para comparar.",
        ...describeTip(verification),
        ...describeDoubts(verification),
      ],
    };
  }
  return {
    tone: "success",
    title: "La suma cuadra",
    details: [
      `Total: ${format(verification.totalCheck.printed)}.`,
      ...describeTip(verification),
      ...describeDoubts(verification),
    ],
  };
}
