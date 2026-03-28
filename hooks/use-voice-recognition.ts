"use client";

import { useState, useCallback, useRef } from "react";
import {
  startListening,
  stopListening,
  isSupported,
} from "@/lib/voice/web-speech-recognizer";

export type VoiceState = "idle" | "listening" | "processing" | "error";

interface UseVoiceRecognitionReturn {
  state: VoiceState;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useVoiceRecognition(): UseVoiceRecognitionReturn {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const transcriptRef = useRef("");

  const start = useCallback(() => {
    setError(null);
    setTranscript("");
    setInterimTranscript("");
    transcriptRef.current = "";

    startListening({
      onStart: () => {
        setState("listening");
      },
      onResult: (text, isFinal) => {
        if (isFinal) {
          transcriptRef.current = transcriptRef.current
            ? `${transcriptRef.current} ${text}`
            : text;
          setTranscript(transcriptRef.current);
          setInterimTranscript("");
        } else {
          setInterimTranscript(text);
        }
      },
      onError: (message) => {
        setError(message);
        setState("error");
      },
      onEnd: () => {
        setState(transcriptRef.current ? "processing" : "idle");
      },
    });
  }, []);

  const stop = useCallback(() => {
    stopListening();
  }, []);

  const reset = useCallback(() => {
    setState("idle");
    setTranscript("");
    setInterimTranscript("");
    setError(null);
    transcriptRef.current = "";
  }, []);

  return {
    state,
    transcript,
    interimTranscript,
    error,
    isSupported: isSupported(),
    start,
    stop,
    reset,
  };
}
