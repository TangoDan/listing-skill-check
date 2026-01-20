import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function decodeAudioData(blob: Blob): Promise<Float32Array> {
  const arrayBuffer = await blob.arrayBuffer();

  // Usamos un context temporal para obtener el AudioBuffer original
  const tempContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const originalBuffer = await tempContext.decodeAudioData(arrayBuffer);
  await tempContext.close();

  // Ahora re-muerstreamos a 16000Hz usando OfflineAudioContext
  // Whisper espera estrictamente 16000Hz.
  const offlineContext = new OfflineAudioContext(
    1,
    Math.ceil(originalBuffer.duration * 16000),
    16000
  );

  const source = offlineContext.createBufferSource();
  source.buffer = originalBuffer;
  source.connect(offlineContext.destination);
  source.start();

  const resampledBuffer = await offlineContext.startRendering();
  return resampledBuffer.getChannelData(0);
}
