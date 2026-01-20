"use client";

import { useState } from "react";
import { Upload, FileAudio, Loader2, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, decodeAudioData } from "@/lib/utils";
import { Dashboard } from "@/components/Dashboard";
import { AnalysisResult } from "@/types/analysis";
import { Language, translations } from "@/lib/translations";
import { whisperService } from "@/lib/whisperService";

// Chunk size: 20MB (safe margin for 25MB limit)
const CHUNK_SIZE = 20 * 1024 * 1024;

export default function Home() {
  const [lang, setLang] = useState<Language>("es");
  const t = translations[lang];

  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // Status states
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [progress, setProgress] = useState(0);

  const [result, setResult] = useState<AnalysisResult | null>(null);

  // API Confirmation state
  const [showApiConfirm, setShowApiConfirm] = useState(false);
  const [resolveApiConfirm, setResolveApiConfirm] = useState<((val: boolean) => void) | null>(null);

  const confirmApiUsage = () => {
    return new Promise<boolean>((resolve) => {
      setResolveApiConfirm(() => resolve);
      setShowApiConfirm(true);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const processAudio = async () => {
    if (!file) return;
    setIsProcessing(true);
    setResult(null);
    setProgress(0);

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const isTextFile = fileExtension === 'txt' || fileExtension === 'md';

      let fullTranscript = "";

      if (isTextFile) {
        // Read text file directly
        setStatusMessage(t.readingTextFile || "Leyendo archivo de texto...");
        fullTranscript = await file.text();
        setProgress(50);
      } else {
        // Audio file: local transcription
        try {
          setStatusMessage("Procesando audio (decodificando)... esto puede tardar en archivos grandes.");
          console.log("DEBUG: Inicia decodificación de audio...");
          const audioData = await decodeAudioData(file);
          console.log(`DEBUG: Audio decodificado. Tamaño: ${audioData.length} muestras. Enviando a worker...`);

          setStatusMessage(t.loadingModel || "Cargando modelo de transcripción local...");
          fullTranscript = await whisperService!.transcribe(
            audioData,
            lang,
            (data: any) => {
              if (data.status === 'progress') {
                setStatusMessage(`${t.loadingModel} ${Math.round(data.progress || 0)}%`);
                setProgress(Math.round((data.progress || 0) * 0.5));
              } else if (data.status === 'update') {
                const partialText = data.text?.slice(-60) || "...";
                setStatusMessage(`${t.transcribing || "Transcribiendo..."}: "${partialText}"`);
                setProgress(Math.min(95, 50 + Math.round(progress * 0.4)));
              }
            }
          );
          setProgress(90);
        } catch (error: any) {
          console.error("Local transcription error:", error);

          setIsProcessing(false);
          const confirmed = await confirmApiUsage();

          if (!confirmed) {
            throw new Error("Proceso cancelado por el usuario.");
          }

          setIsProcessing(true);
          setStatusMessage(t.fallingBack || "Error en local, reintentando con API...");

          const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

          for (let i = 0; i < totalChunks; i++) {
            setStatusMessage(`${t.transcribingPart} ${i + 1} ${t.of} ${totalChunks}...`);

            const start = i * CHUNK_SIZE;
            const end = Math.min(file.size, start + CHUNK_SIZE);
            const chunk = file.slice(start, end);

            const formData = new FormData();
            formData.append("file", chunk, file.name);

            const res = await fetch("/api/transcribe", {
              method: "POST",
              body: formData,
            });

            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.error || "Transcription failed");
            }

            const data = await res.json();
            fullTranscript += (data.text || "") + " ";

            setProgress(Math.round(((i + 1) / (totalChunks + 1)) * 100));
          }
        }
      }

      // 2. Analysis Logic
      setStatusMessage(t.analyzingFull);
      console.log("Full transcript length:", fullTranscript.length);

      const resAnalysis = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: fullTranscript, language: lang }),
      });

      if (!resAnalysis.ok) {
        const err = await resAnalysis.json();
        throw new Error(err.error || "Analysis failed");
      }

      const finalResult = await resAnalysis.json();
      setResult({
        ...finalResult,
        transcript: fullTranscript
      });

    } catch (e: any) {
      alert("Error: " + e.message);
      console.error(e);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
      setProgress(0);
    }
  };

  const toggleLang = () => {
    setLang(prev => prev === "es" ? "en" : "es");
  };

  return (
    <>
      <main className="container mx-auto px-4 py-20 max-w-5xl relative">
        {/* Language Toggle */}
        <button
          onClick={toggleLang}
          className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors text-sm"
        >
          <Globe size={16} />
          {lang === "es" ? "ES" : "EN"}
        </button>

        <div className="text-center mb-16 space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent"
          >
            {t.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-xl max-w-2xl mx-auto space-y-2"
          >
            <span>{t.subtitleLine1}</span>
            <br />
            <span className="text-slate-300">{t.subtitleLine2}</span>
            <br />
            <span className="text-sm text-green-400/80 font-mono block pt-2">{t.largeFileNote}</span>
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ delay: 0.4 }}
              className={cn(
                "relative group rounded-3xl border-2 border-dashed transition-all duration-300 p-12 text-center",
                isDragging ? "border-primary bg-primary/5" : "border-slate-800 bg-slate-900/50 hover:border-slate-700",
                file && "border-solid border-green-500/50 bg-green-500/5",
                isProcessing && "opacity-80 pointer-events-none"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className={cn(
                  "p-6 rounded-full transition-colors",
                  file ? "bg-green-500/20 text-green-400" : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white"
                )}>
                  {isProcessing ? <Loader2 size={40} className="animate-spin" /> : (file ? <FileAudio size={40} /> : <Upload size={40} />)}
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold">
                    {file ? file.name : t.dropZone}
                  </h3>
                  <p className="text-slate-500">
                    {isProcessing ? statusMessage : (file ? t.readyToAnalyze : t.dropZoneAlt)}
                  </p>
                </div>

                {/* Progress Bar */}
                {isProcessing && (
                  <div className="w-full max-w-xs h-2 bg-slate-800 rounded-full overflow-hidden mt-4">
                    <div
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                {file && !isProcessing && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      processAudio();
                    }}
                    className="mt-4 px-8 py-3 relative z-20 rounded-full bg-white text-black font-semibold hover:bg-slate-200 transition-colors flex items-center gap-2"
                  >
                    {t.startAnalysis}
                  </button>
                )}

                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                  accept="audio/*,.txt,.md"
                />
              </div>
            </motion.div>
          ) : (
            <Dashboard key="dashboard" data={result} lang={lang} />
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed border-t border-slate-800/50 pt-8">
            {t.disclaimer}
          </p>
        </motion.div>
      </main>

      <AnimatePresence>
        {showApiConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-6"
            >
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">{t.apiConfirmTitle}</h3>
                <p className="text-slate-400 leading-relaxed">
                  {t.apiConfirmMessage}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowApiConfirm(false);
                    resolveApiConfirm?.(true);
                  }}
                  className="w-full py-3 bg-white text-black font-bold rounded-full hover:bg-slate-200 transition-colors"
                >
                  {t.apiConfirmButton}
                </button>
                <button
                  onClick={() => {
                    setShowApiConfirm(false);
                    resolveApiConfirm?.(false);
                  }}
                  className="w-full py-3 bg-slate-800 text-white font-bold rounded-full hover:bg-slate-700 transition-colors"
                >
                  {t.apiCancelButton}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
