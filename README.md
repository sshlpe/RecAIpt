# RecAIpt

Saca una foto a una boleta y léela en letra grande, con los productos repetidos agrupados
y la suma verificada. Pensada para personas con baja visión que hoy le sacan foto a la cuenta
y le hacen zoom para revisarla.

- **Lectura**: la boleta se reescribe en letra grande, y se puede leer en voz alta.
- **Agrupación**: "1 coca, 1 pan, 1 coca, 1 cerveza, 1 coca" → `3 × Coca-Cola`.
- **Verificación**: suma los productos y la compara con el total escrito (útil sobre todo en
  boletas escritas a mano). Nunca afirma un cobro de más: una diferencia puede ser un error
  de lectura de la foto.
- **Correcciones**: si la IA lee mal un monto o un nombre, se corrige en la app y el total
  se recalcula.

Es un proyecto personal sin fines de lucro. Aportes y forks son bienvenidos.

## Cómo funciona

1. La foto se reduce en el teléfono y se envía al servidor.
2. Una sola llamada a un modelo de visión (Gemini o Claude) **transcribe** la boleta a un JSON
   con schema fijo (`src/lib/receipt/receipt-schema.ts`).
3. Agrupar, sumar y verificar es **código determinista**, no la IA
   (`src/lib/receipt/`). El modelo solo transcribe; nunca suma.

## Correr localmente

Requiere Node 22 (ver `.nvmrc`; con [fnm](https://github.com/Schniz/fnm): `fnm use`).

```bash
npm install
cp .env.example .env.local   # pega tu API key
npm run dev
```

La key gratuita de Gemini se obtiene en [Google AI Studio](https://aistudio.google.com/apikey).
Para usar Claude: `LLM_PROVIDER=claude` y `ANTHROPIC_API_KEY` en `.env.local`.

Para probar desde el teléfono, abre la URL de "Network" que muestra `npm run dev`
(mismo Wi-Fi o hotspot).

## Publicar en Cloudflare

La app corre como Cloudflare Worker con el adaptador
[OpenNext](https://opennext.js.org/cloudflare) (configuración en `wrangler.jsonc`).

- **Deploy**: con Workers Builds, cada push a `main` compila y publica
  (build: `npx opennextjs-cloudflare build`, deploy: `npx opennextjs-cloudflare deploy`).
- **API key**: como secret del Worker (`npx wrangler secret put GEMINI_API_KEY` o desde el panel).
  Nunca en archivos `.env*` al publicar: el adaptador los empaqueta dentro del Worker, y
  `npm run deploy` se niega a publicar si los encuentra con keys.
- **Límite de uso**: 10 lecturas por minuto por IP (binding `RECEIPT_RATE_LIMITER`), para que
  una URL pública no agote la cuota del LLM.
- **Probar localmente en el runtime de Workers**: `npm run cf:preview`.

## Contribuir

Las convenciones del código están en [`CLAUDE.md`](CLAUDE.md): código modular y reutilizable,
máximo 400 líneas por archivo, sin lógica duplicada. Antes de abrir un PR:

```bash
npm run check   # tipos + lint + duplicados
```

## Licencia

[MIT](LICENSE)
