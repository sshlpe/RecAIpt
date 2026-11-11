"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { isSpeechSupported, speakText, stopSpeaking } from "@/lib/speech/speak-text";
import { IconButton } from "./ui/icon-button";
import { SpeakerIcon, StopIcon } from "./ui/icons";

const subscribeToNothing = () => () => {};

/** Ícono de parlante: lee un texto en voz alta; vuelve a presionarse para detener. */
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
    <IconButton
      icon={isSpeaking ? <StopIcon /> : <SpeakerIcon />}
      label={isSpeaking ? "Detener lectura" : "Leer en voz alta"}
      onClick={toggleSpeech}
      aria-pressed={isSpeaking}
    />
  );
}
