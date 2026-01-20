export class WhisperService {
    private worker: Worker | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            this.worker = new Worker('/whisper-worker.js', {
                type: 'module'
            });
        }
    }

    async transcribe(audio: Float32Array, language: string, onProgress?: (data: any) => void): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.worker) {
                reject(new Error('Worker not initialized'));
                return;
            }

            const timeout = setTimeout(() => {
                this.worker?.removeEventListener('message', messageHandler);
                reject(new Error('Local transcription timed out after 10 minutes'));
            }, 600000);

            const messageHandler = (event: MessageEvent) => {
                const { status, text, error, ...rest } = event.data;

                if (status === 'progress' || status === 'update') {
                    if (onProgress) onProgress(event.data);
                } else if (status === 'complete') {
                    clearTimeout(timeout);
                    this.worker?.removeEventListener('message', messageHandler);
                    resolve(text);
                } else if (status === 'error') {
                    clearTimeout(timeout);
                    this.worker?.removeEventListener('message', messageHandler);
                    reject(new Error(error));
                }
            };

            this.worker.addEventListener('message', messageHandler);
            console.log("DEBUG: Enviando audio al worker (usando transferencia)...");
            // Usamos transferencia para evitar clonar 300MB+ de datos
            this.worker.postMessage({ audio, language }, [audio.buffer]);
        });
    }

    terminate() {
        this.worker?.terminate();
        this.worker = null;
    }
}

export const whisperService = typeof window !== 'undefined' ? new WhisperService() : null;
