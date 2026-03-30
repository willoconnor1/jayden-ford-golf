/**
 * Mobile audio recorder using expo-av.
 * Uses lazy import to avoid crashing when native module isn't available (Expo Go).
 */

let AudioModule: typeof import("expo-av").Audio | null = null;

async function getAudio() {
  if (!AudioModule) {
    const mod = await import("expo-av");
    AudioModule = mod.Audio;
  }
  return AudioModule;
}

let recording: any = null;

export async function requestPermissions(): Promise<boolean> {
  const Audio = await getAudio();
  const { granted } = await Audio.requestPermissionsAsync();
  return granted;
}

export async function startRecording(): Promise<void> {
  const Audio = await getAudio();
  const granted = await requestPermissions();
  if (!granted) throw new Error("Microphone permission denied");

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  const { recording: rec } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );
  recording = rec;
}

export async function stopRecording(): Promise<string> {
  if (!recording) throw new Error("No active recording");

  await recording.stopAndUnloadAsync();
  const Audio = await getAudio();
  await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

  const uri = recording.getURI();
  recording = null;

  if (!uri) throw new Error("Recording URI not available");
  return uri;
}

export function cancelRecording(): void {
  if (recording) {
    recording.stopAndUnloadAsync().catch(() => {});
    recording = null;
  }
}
