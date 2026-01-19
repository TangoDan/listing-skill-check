export type Language = "es" | "en";

export const translations = {
    es: {
        // Main page
        title: "Analizador de Entrevistas",
        subtitle: "Eleva tu rendimiento comercial inmobiliario con análisis impulsados por IA. Sube tu grabación o transcripción para empezar.",
        largeFileNote: "Archivos grandes (+25MB) y texto (.txt, .md) soportados.",
        dropZone: "Arrastra la grabación aquí",
        dropZoneAlt: "o haz clic para buscar manualmente",
        readyToAnalyze: "Listo para analizar",
        startAnalysis: "Iniciar Análisis",
        transcribingPart: "Transcribiendo parte",
        of: "de",
        analyzingFull: "Analizando conversación completa con IA...",
        readingTextFile: "Leyendo archivo de texto...",

        // Dashboard
        interviewPerformance: "Rendimiento de la Entrevista",
        aiAnalysis: "Análisis IA basado en Preguntas Doradas",
        qualification: "Calificación",
        trust_building: "Construcción de Confianza",
        closing: "Cierre",
        missedQuestions: "Preguntas Olvidadas",
        recommendations: "Recomendaciones",
        actionPlan: "Plan de Acción",

        // Export
        exportPDF: "Exportar PDF",
        exportMD: "Exportar Informe (MD)",
        exportTranscript: "Exportar Transcripción (MD)",

        // Settings
        language: "Idioma",
    },
    en: {
        // Main page
        title: "Interview Analyzer",
        subtitle: "Elevate your real estate sales performance with AI-driven insights. Upload your recording or transcript to get started.",
        largeFileNote: "Large files (>25MB) and text (.txt, .md) supported.",
        dropZone: "Drop interview recording here",
        dropZoneAlt: "or click to browse manually",
        readyToAnalyze: "Ready to analyze",
        startAnalysis: "Start Analysis",
        transcribingPart: "Transcribing part",
        of: "of",
        analyzingFull: "Analyzing full conversation with AI...",
        readingTextFile: "Reading text file...",

        // Dashboard
        interviewPerformance: "Interview Performance",
        aiAnalysis: "AI Analysis based on Golden Questions",
        qualification: "Qualification",
        trust_building: "Trust Building",
        closing: "Closing",
        missedQuestions: "Missed Questions",
        recommendations: "Recommendations",
        actionPlan: "Action Plan",

        // Export
        exportPDF: "Export PDF",
        exportMD: "Export Report (MD)",
        exportTranscript: "Export Transcript (MD)",

        // Settings
        language: "Language",
    },
} as const;

export type TranslationKey = keyof typeof translations.es;
