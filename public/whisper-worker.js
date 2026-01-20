// Cargamos la librería local desde la misma carpeta public
import { pipeline, env } from './transformers.js';

// Configuración de entorno
env.allowLocalModels = false;
env.useBrowserCache = true;

class WhisperWorker {
    static instance = null;

    static async getInstance(progress_callback) {
        if (this.instance === null) {
            console.log("Worker: Cargando modelo Xenova/whisper-base...");
            this.instance = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base', {
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
        console.log("Worker: Procesando audio de tamaño:", audio.length);

        const transcriber = await WhisperWorker.getInstance((data) => {
            self.postMessage({
                status: 'progress',
                ...data
            });
        });

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
