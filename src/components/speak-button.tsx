"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { isSpeechSupported, speakText, stopSpeaking } from "@/lib/speech/speak-text";
import { ActionButton } from "./ui/action-button";

const subscribeToNothing = () => () => {};

/** Botón para leer un texto en voz alta; vuelve a presionarse para detener. */
export function SpeakButton({ text }: { text: string }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isSupported = useSyncExternalStore(subscribeToNothing, isSpeechSupported, () => false);

  useEffect(() => stopSpeaking, []);

  if (!isSupported) return null;

  function toggleSpeech() {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    speakText(text, () => setIsSpeaking(false));
  }

  return (
    <ActionButton variant="secondary" onClick={toggleSpeech} aria-pressed={isSpeaking}>
      <span aria-hidden>{isSpeaking ? "⏹" : "🔊"}</span>
      {isSpeaking ? "Detener lectura" : "Leer en voz alta"}
    </ActionButton>
  );
}
