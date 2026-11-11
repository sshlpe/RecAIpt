/**
 * Lectura en voz alta con la voz del sistema (Web Speech API). Sin permisos; en iPhone no suena
 * con el interruptor de silencio activado.
 */

/** Una frase y cuánto esperar después: los navegadores ignoran SSML, así se logran las pausas. */
export interface SpokenSegment {
  text: string;
  pauseAfterMs: number;
}

const SPEECH_RATE = 0.95;
/** Si todavía no cargan las voces: español latino (no hay voces es-CL en iOS ni en Chrome). */
const FALLBACK_LANGUAGE = "es-MX";
/** Acento preferido: latinoamericano antes que España. */
const PREFERRED_REGIONS = ["es-CL", "es-419", "es-US", "es-MX", "es-AR", "es-CO"];
/** Calidad en el nombre o URI de la voz (iOS: com.apple.voice.premium.es-MX.Paulina). */
const QUALITY_PATTERNS = [/premium/i, /enhanced|mejorad/i];

/** Sube con cada lectura nueva o detenida: los callbacks de una lectura anterior no siguen. */
let speechGeneration = 0;
let pauseTimer: ReturnType<typeof setTimeout> | undefined;

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Pedir la lista hace que el navegador empiece a cargarla (en Chrome e iOS llega tarde). */
export function prepareVoices(): void {
  if (isSpeechSupported()) window.speechSynthesis.getVoices();
}

function normalizeLanguage(lang: string): string {
  return lang.replace("_", "-");
}

function qualityScore(voice: SpeechSynthesisVoice): number {
  const label = `${voice.name} ${voice.voiceURI}`;
  const index = QUALITY_PATTERNS.findIndex((pattern) => pattern.test(label));
  return index === -1 ? 0 : QUALITY_PATTERNS.length - index;
}

function regionScore(voice: SpeechSynthesisVoice): number {
  const index = PREFERRED_REGIONS.indexOf(normalizeLanguage(voice.lang));
  return index === -1 ? 0 : PREFERRED_REGIONS.length - index;
}

/** La mejor voz en español instalada: primero la calidad (premium, mejorada), después el acento. */
function pickSpanishVoice(): SpeechSynthesisVoice | null {
  const spanishVoices = window.speechSynthesis
    .getVoices()
    .filter((voice) => normalizeLanguage(voice.lang).startsWith("es"));
  const score = (voice: SpeechSynthesisVoice) => qualityScore(voice) * 100 + regionScore(voice);
  return spanishVoices.sort((a, b) => score(b) - score(a))[0] ?? null;
}

export function stopSpeaking(): void {
  if (!isSpeechSupported()) return;
  speechGeneration += 1;
  clearTimeout(pauseTimer);
  const { speechSynthesis } = window;
  if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
}

/** Lee las frases en orden, con su pausa después; `onEnd` al terminar todas o si falla. */
export function speakSegments(segments: SpokenSegment[], onEnd?: () => void): void {
  if (!isSpeechSupported()) return;
  stopSpeaking();
  const generation = speechGeneration;
  const isCurrent = () => generation === speechGeneration;
  const voice = pickSpanishVoice();

  function speakAt(index: number) {
    if (!isCurrent()) return;
    if (index >= segments.length) return onEnd?.();
    const utterance = new SpeechSynthesisUtterance(segments[index].text);
    utterance.voice = voice;
    // El idioma de la voz elegida: pedir "es-CL" sin voz es-CL deja a iOS mudo a veces.
    utterance.lang = voice ? voice.lang : FALLBACK_LANGUAGE;
    utterance.rate = SPEECH_RATE;
    utterance.onend = () => {
      if (isCurrent())
        pauseTimer = setTimeout(() => speakAt(index + 1), segments[index].pauseAfterMs);
    };
    utterance.onerror = (event) => {
      // "interrupted"/"canceled" son esperables al detener; el resto ayuda a diagnosticar.
      if (event.error !== "interrupted" && event.error !== "canceled") {
        console.error("Lectura en voz alta falló:", event.error);
      }
      if (isCurrent()) onEnd?.();
    };
    // Chrome puede quedar en pausa tras un error previo: sin resume, speak no suena.
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
  }

  speakAt(0);
}
