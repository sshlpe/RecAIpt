"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  isSpeechSupported,
  prepareVoices,
  speakSegments,
  stopSpeaking,
  type SpokenSegment,
} from "@/lib/speech/speak-text";
import { IconButton } from "./ui/icon-button";
import { SpeakerIcon, StopIcon } from "./ui/icons";

const subscribeToNothing = () => () => {};

/** Ícono de parlante: lee un texto en voz alta; vuelve a presionarse para detener. */
export function SpeakButton({ segments }: { segments: SpokenSegment[] }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isSupported = useSyncExternalStore(subscribeToNothing, isSpeechSupported, () => false);

  useEffect(() => {
    // Las voces cargan tarde: pedirlas al montar deja lista la mejor para el primer toque.
    prepareVoices();
    return stopSpeaking;
  }, []);

  if (!isSupported) return null;

  function toggleSpeech() {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    speakSegments(segments, () => setIsSpeaking(false));
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
