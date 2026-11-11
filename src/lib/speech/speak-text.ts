const SPEECH_LANGUAGE = "es-CL";
const SPEECH_RATE = 0.9;

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function findSpanishVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((voice) => voice.lang === SPEECH_LANGUAGE) ??
    voices.find((voice) => voice.lang.startsWith("es"))
  );
}

export function stopSpeaking(): void {
  if (!isSpeechSupported()) return;
  const { speechSynthesis } = window;
  if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
}

/** Lee el texto en voz alta con voz en español; `onEnd` se llama al terminar o cancelar. */
export function speakText(text: string, onEnd?: () => void): void {
  if (!isSpeechSupported()) return;
  stopSpeaking();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = SPEECH_LANGUAGE;
  utterance.rate = SPEECH_RATE;
  utterance.voice = findSpanishVoice() ?? null;
  utterance.onend = () => onEnd?.();
  utterance.onerror = (event) => {
    // "interrupted"/"canceled" son esperables al detener; el resto ayuda a diagnosticar.
    if (event.error !== "interrupted" && event.error !== "canceled") {
      console.error("Lectura en voz alta falló:", event.error);
    }
    onEnd?.();
  };
  // Chrome puede quedar en pausa tras un error previo: sin resume, speak no suena.
  window.speechSynthesis.resume();
  window.speechSynthesis.speak(utterance);
}
