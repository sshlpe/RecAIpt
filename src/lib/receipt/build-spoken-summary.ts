import { formatSpokenAmount } from "@/lib/format/currency";
import { formatQuantity, formatSpokenPercent } from "@/lib/format/format-numbers";
import type { SpokenSegment } from "@/lib/speech/speak-text";
import { isDoubtful } from "./confidence";
import { describeVerification } from "./describe-verification";
import type { EditableReceipt } from "./editable-receipt";
import type { ItemGroup } from "./group-items";
import { receiptSpokenDate } from "./receipt-info";
import type { ReceiptSummary } from "./summarize-receipt";
import { tipPercentOf } from "./tip";

/**
 * Guion para escuchar la boleta, armado por el código (nunca por la IA: los montos tienen que ser
 * exactos y quien escucha no puede compararlos). Orden pensado para alguien que no mira la
 * pantalla: dónde y cuándo, cuánto pagar, cada producto, cargos y, al final, si la suma cuadra.
 */

const PAUSE_BETWEEN_LINES_MS = 400;
const PAUSE_BETWEEN_SECTIONS_MS = 900;

/** Frases de una sección: pausa corta entre ellas y una más larga al terminar. */
function toSection(sentences: string[]): SpokenSegment[] {
  return sentences.map((text, index) => ({
    text,
    pauseAfterMs:
      index === sentences.length - 1 ? PAUSE_BETWEEN_SECTIONS_MS : PAUSE_BETWEEN_LINES_MS,
  }));
}

function describeIntro(receipt: EditableReceipt, readAt: string): string {
  const date = receiptSpokenDate(receipt, readAt);
  const merchant = receipt.merchantName?.trim();
  return merchant ? `Boleta de ${merchant}, del ${date}.` : `Boleta del ${date}.`;
}

/** "2 unidades" solo si hay más de una; por peso (1,45) se dice como cantidad. */
function describeQuantity(quantity: number): string {
  if (quantity === 1) return "";
  return Number.isInteger(quantity)
    ? `${quantity} unidades, `
    : `cantidad ${formatQuantity(quantity)}, `;
}

function describeProducts(groups: ItemGroup[], speakAmount: (amount: number) => string): string[] {
  const count = groups.length === 1 ? "Es un producto." : `Son ${groups.length} productos.`;
  return [
    count,
    ...groups.map(
      (group) =>
        `${group.name}: ${describeQuantity(group.totalQuantity)}${speakAmount(group.totalAmount)}.`,
    ),
  ];
}

function describeCharges(
  summary: ReceiptSummary,
  speakAmount: (amount: number) => string,
): string[] {
  const { discount, taxes, tip } = summary.charges;
  const tipPercent = tipPercentOf(tip, summary.tipBase);
  const tipLabel =
    tipPercent === null ? "Propina" : `Propina del ${formatSpokenPercent(tipPercent)}`;
  return [
    ...(discount > 0 ? [`Descuento: ${speakAmount(discount)}.`] : []),
    ...(taxes > 0 ? [`Impuestos que se suman aparte: ${speakAmount(taxes)}.`] : []),
    ...(tip > 0 ? [`${tipLabel}: ${speakAmount(tip)}.`] : []),
  ];
}

/** Punto final si falta: la voz hace la pausa de fin de frase. */
function endSentence(text: string): string {
  return /[.!?]$/.test(text.trim()) ? text.trim() : `${text.trim()}.`;
}

/** Cada línea dudosa por su nombre: quien escucha no ve cuál está marcada. */
function describeDoubtfulItems(receipt: EditableReceipt): string[] {
  return receipt.items
    .filter((item) => isDoubtful(item.confidence))
    .map((item) =>
      item.doubtReason
        ? `Revisa ${item.name}: ${endSentence(item.doubtReason)}`
        : `Revisa ${item.name}: no se leyó con total seguridad.`,
    );
}

/** Al final: si la suma cuadra con lo escrito y qué conviene revisar. */
function describeCheck(
  receipt: EditableReceipt,
  summary: ReceiptSummary,
  speakAmount: (amount: number) => string,
): string[] {
  const { verification, groups } = summary;
  if (!verification.isConsistent) {
    const message = describeVerification(verification, groups.length, speakAmount);
    return [`${message.title}.`, ...message.details];
  }
  const result =
    verification.totalCheck === null
      ? "No hay un total escrito en la boleta para comparar."
      : "La suma cuadra con el total de la boleta.";
  return [result, ...describeDoubtfulItems(receipt)];
}

export function buildSpokenReceipt(
  receipt: EditableReceipt,
  readAt: string,
  summary: ReceiptSummary,
): SpokenSegment[] {
  const speakAmount = (amount: number) => formatSpokenAmount(amount, summary.currency);
  const withTip = summary.charges.tip > 0 ? ", con propina" : "";
  return [
    ...toSection([describeIntro(receipt, readAt)]),
    ...toSection([`Total a pagar${withTip}: ${speakAmount(summary.payableTotal)}.`]),
    ...toSection(describeProducts(summary.groups, speakAmount)),
    ...toSection(describeCharges(summary, speakAmount)),
    ...toSection(describeCheck(receipt, summary, speakAmount)),
  ];
}
