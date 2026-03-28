/**
 * Web audio recorder using the MediaRecorder API.
 * Records microphone audio and returns a Blob for upload.
 */

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let resolveStop: ((blob: Blob) => void) | null = null;

export function isSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== "undefined"
  );
}

export async function startRecording(): Promise<void> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  // Prefer webm/opus (Whisper supports it), fall back to whatever is available
  const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
    ? "audio/webm;codecs=opus"
    : MediaRecorder.isTypeSupported("audio/webm")
      ? "audio/webm"
      : undefined; // Let browser pick default

  audioChunks = [];
  mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      audioChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = () => {
    // Stop all tracks to release the microphone
    stream.getTracks().forEach((track) => track.stop());

    const blob = new Blob(audioChunks, {
      type: mediaRecorder?.mimeType || "audio/webm",
    });
    audioChunks = [];

    if (resolveStop) {
      resolveStop(blob);
      resolveStop = null;
    }
  };

  mediaRecorder.start();
}

export function stopRecording(): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
      reject(new Error("No active recording"));
      return;
    }
    resolveStop = resolve;
    mediaRecorder.stop();
  });
}

export function cancelRecording(): void {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
  resolveStop = null;
  audioChunks = [];
}
