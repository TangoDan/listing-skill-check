/* eslint-disable no-undef */

// IMPORTANTE: Usamos self.location.origin para asegurar que la ruta sea válida
// independientemente de cómo Next.js sirva el worker.
try {
    const libUrl = self.location.origin + '/transformers.js';
    console.log("Worker: Intentando cargar librería desde:", libUrl);
    importScripts(libUrl);
} catch (e) {
    console.error("Worker: Error cargando importScripts:", e);
}

// @ts-ignore
const { pipeline, env } = self.Transformers;

// Configuración de entorno
env.allowLocalModels = false;
env.useBrowserCache = true;

class WhisperWorker {
    static instance = null;

    static async getInstance(progress_callback) {
        if (this.instance === null) {
            console.log("Worker: Cargando modelo local Xenova/whisper-tiny...");
            this.instance = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
                progress_callback,
            });
            console.log("Worker: Modelo cargado con éxito.");
        }
        return this.instance;
    }
}

self.onmessage = async (event) => {
    const { audio, language } = event.data;

    try {
        console.log("Worker: Recibido audio de tamaño:", audio.length);

        const transcriber = await WhisperWorker.getInstance((data) => {
            self.postMessage({
                status: 'progress',
                ...data
            });
        });

        console.log("Worker: Iniciando transcripción local...");
        const output = await transcriber(audio, {
            chunk_length_s: 30,
            stride_length_s: 5,
            language: language === 'es' ? 'spanish' : 'english',
            task: 'transcribe',
            callback_function: (beams) => {
                if (beams && beams[0]) {
                    self.postMessage({
                        status: 'update',
                        text: beams[0].text
                    });
                }
            }
        });

        console.log("Worker: Transcripción local completada.");
        self.postMessage({
            status: 'complete',
            text: output.text
        });
    } catch (error) {
        console.error("Worker Error:", error);
        self.postMessage({
            status: 'error',
            error: error.message || "Error en el worker local"
        });
    }
};
