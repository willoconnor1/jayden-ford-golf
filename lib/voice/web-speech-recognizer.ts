/**
 * Web Speech API wrapper.
 * Uses the browser's built-in SpeechRecognition (Chrome, Edge, Safari).
 */

type SpeechRecognitionType = typeof window extends { SpeechRecognition: infer T } ? T : any;

export interface WebSpeechCallbacks {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onEnd: () => void;
  onStart: () => void;
}

let recognition: any = null;

export function isSupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
}

export function startListening(callbacks: WebSpeechCallbacks): void {
  if (!isSupported()) {
    callbacks.onError("Speech recognition is not supported in this browser.");
    return;
  }

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.continuous = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    callbacks.onStart();
  };

  recognition.onresult = (event: any) => {
    let finalTranscript = "";
    let interimTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        finalTranscript += result[0].transcript;
      } else {
        interimTranscript += result[0].transcript;
      }
    }

    if (finalTranscript) {
      callbacks.onResult(finalTranscript, true);
    } else if (interimTranscript) {
      callbacks.onResult(interimTranscript, false);
    }
  };

  recognition.onerror = (event: any) => {
    const message =
      event.error === "no-speech"
        ? "No speech detected. Try again."
        : `Speech error: ${event.error}`;
    callbacks.onError(message);
  };

  recognition.onend = () => {
    callbacks.onEnd();
  };

  recognition.start();
}

export function stopListening(): void {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
}
