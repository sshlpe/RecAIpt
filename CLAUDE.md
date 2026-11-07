@AGENTS.md

# RecAIpt

PWA (Next.js) para leer boletas con una foto: las reescribe en letra grande, agrupa ítems
repetidos y verifica que la suma cuadre. Usuario principal: adulto mayor con baja visión
(hoy saca foto a la boleta y le hace zoom). Prioridades: 1) lectura, 2) agrupar,
3) verificar sumas (sobre todo boletas escritas a mano).

## Arquitectura

- **Una sola llamada al LLM por boleta**: imagen → JSON con schema fijo (`src/lib/receipt/receipt-schema.ts`).
- **El LLM solo transcribe; el código calcula.** Agrupar, sumar y verificar es lógica
  determinista en `src/lib/receipt/`. Nunca pedirle al modelo que sume o juzgue.
- **Proveedor de LLM intercambiable**: cada proveedor implementa `ReceiptExtractor`
  (`src/lib/extraction/`). Se elige con `LLM_PROVIDER` en `.env.local`.
- **Correcciones del usuario en el cliente**: la boleta leída se vuelve editable
  (`src/lib/receipt/editable-receipt.ts`, funciones puras) y todo se recalcula con
  `summarizeReceipt`. El "total real" sale de los productos, no del total escrito.
- La API key vive solo en el servidor (route handler `src/app/api/analyze-receipt/`).
- Ante una suma que no cuadra, la UI nunca dice "te cobraron de más": señala las líneas
  dudosas para revisar. Un error de lectura y un error de cobro se ven igual.

## Metodología de código (obligatoria)

1. **Código general y reutilizable.** Si una lógica se usa más de una vez, se extrae a una
   función general y se reutiliza. Nunca dos implementaciones de lo mismo escritas distinto.
   Antes de escribir una función, buscar si ya existe una equivalente.
2. **Modular.** Una carpeta por dominio y un archivo por responsabilidad. Lo reutilizable vive
   en `src/lib/` (lógica) y `src/components/ui/` (componentes visuales genéricos).
3. **Máximo 400 líneas por archivo** (lo hace cumplir ESLint con `max-lines`).
4. **Funciones específicas** que hacen una sola cosa, con nombres descriptivos
   (`groupItemsByName`, no `process`).
5. **Sin mezclas.** No se mezcla UI con lógica de negocio ni llamadas de red dentro de componentes
   de presentación. Los componentes reciben datos ya calculados.
6. **Estilo** (equivalente TS de PEP 8, lo aplican Prettier + ESLint):
   - Identificadores y nombres de archivo en **inglés**; textos visibles en la UI en **español**.
   - `camelCase` funciones y variables, `PascalCase` componentes y tipos,
     `UPPER_SNAKE_CASE` constantes, `kebab-case` nombres de archivo.
   - Ancho de línea 100, indentación 2 espacios (Prettier).
7. **Verificación antes de dar algo por terminado:** `npm run check` (tipos + lint + duplicados).

## Estructura

```
src/
  app/                 rutas (page, layout, manifest) y API (api/analyze-receipt)
  components/          componentes de la app
  hooks/               estado de React (análisis de la foto, boleta editable)
    ui/                componentes visuales genéricos reutilizables
  lib/
    receipt/           schema, agrupación, verificación de sumas
    extraction/        prompt, interfaz ReceiptExtractor, proveedores LLM
    image/             reducción de imagen en el cliente
    speech/            lectura en voz alta
    format/            formato de montos (CLP)
    api/               cliente HTTP del frontend hacia la API propia
scripts/               utilidades de desarrollo (chequeo de versión de Node antes de dev/build)
```
