import { z } from "zod";

/**
 * Fuente única de verdad del formato que devuelve el LLM.
 * De aquí salen: los tipos TS, el JSON Schema que se envía a cada proveedor
 * y la validación de la respuesta.
 */

export const CONFIDENCE_LEVELS = ["high", "medium", "low"] as const;
export const RECEIPT_TYPES = ["printed", "handwritten", "mixed"] as const;

const AMOUNT_FORMAT =
  "Número en unidades de la moneda, con decimales si los tiene " +
  '(ej: "9,00" en euros -> 9; "221,85" -> 221.85; "12.500" en pesos chilenos -> 12500).';

/** Monto obligatorio, con descripción del formato numérico. */
function amountField(description: string) {
  return z.number().describe(`${description} ${AMOUNT_FORMAT}`);
}

/** Monto que puede no aparecer en la boleta. */
function optionalAmountField(description: string) {
  return z.number().nullable().describe(`${description} ${AMOUNT_FORMAT} null si no aparece.`);
}

export const receiptItemSchema = z.object({
  originalText: z
    .string()
    .describe("Texto de la línea tal como aparece en la boleta, sin corregir abreviaturas."),
  name: z
    .string()
    .describe(
      "Nombre normalizado y legible del producto, consistente entre líneas iguales " +
        '(ej: "CC ZERO 350" y "COCA ZERO" -> "Coca-Cola Zero").',
    ),
  quantity: z
    .number()
    .describe('Cantidad, con decimales si es por peso ("1,45" -> 1.45). Si no se indica, 1.'),
  unitPrice: optionalAmountField(
    "Precio unitario, solo si aparece escrito en la boleta. Nunca lo calcules dividiendo el total.",
  ),
  lineTotal: amountField("Total de la línea, tal como está escrito."),
  confidence: z
    .enum(CONFIDENCE_LEVELS)
    .describe("Qué tan seguro estás de haber leído bien los números y el nombre de esta línea."),
  doubtReason: z
    .string()
    .nullable()
    .describe(
      'Si la confianza no es "high", qué es dudoso (ej: "el 7 podría ser 1"). Si no, null.',
    ),
});

export const receiptSchema = z.object({
  receiptType: z
    .enum(RECEIPT_TYPES)
    .describe("Si la boleta está impresa, escrita a mano o mezcla ambas."),
  currency: z
    .string()
    .describe(
      "Código ISO 4217 de la moneda (CLP, EUR, USD...). Dedúcelo de símbolos, país, idioma o " +
        "formato de los números. Si no hay pistas, CLP.",
    ),
  merchantName: z
    .string()
    .nullable()
    .describe("Nombre del local o comercio, tal como aparece en la boleta. null si no aparece."),
  purchaseDate: z
    .string()
    .nullable()
    .describe(
      'Fecha de la compra en formato "YYYY-MM-DD" (ej: "10/11/26" -> "2026-11-10"). ' +
        "null si no aparece.",
    ),
  items: z.array(receiptItemSchema).describe("Cada línea de producto cobrado, en orden."),
  printedSubtotal: optionalAmountField(
    "Monto escrito que corresponde a la SUMA DE LOS PRODUCTOS, se llame Subtotal, Valor o " +
      'Consumo. Si la línea "Subtotal" ya incluye impuestos agregados aparte, NO es esta. ' +
      'Tampoco la base imponible, el neto ni montos "sin IVA".',
  ),
  printedDiscount: optionalAmountField("Descuento total escrito, como número positivo."),
  printedTaxes: optionalAmountField(
    "Impuestos que se SUMAN APARTE al consumo (ej: IPC o impuesto al consumo, IVA agregado " +
      "al final, cargo por servicio obligatorio). Si hay varios, súmalos. NO incluyas impuestos " +
      "ya incluidos en los precios (ej: el IVA de una boleta chilena).",
  ),
  printedTip: optionalAmountField("Propina escrita."),
  printedTotal: optionalAmountField("Total final a pagar escrito."),
});

export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];
export type ReceiptType = (typeof RECEIPT_TYPES)[number];
export type ReceiptItem = z.infer<typeof receiptItemSchema>;
export type Receipt = z.infer<typeof receiptSchema>;
