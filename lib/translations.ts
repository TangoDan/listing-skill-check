export type Language = "es" | "en";

export const translations = {
    es: {
        // Main page
        title: "Evaluación Profesional de Habilidades en Pre-Listings",
        subtitleLine1: "Evaluación estandarizada de habilidades comerciales observables en entrevistas de captación.",
        subtitleLine2: "Subí una entrevista de captación para obtener una evaluación estructurada de habilidades comerciales.",
        largeFileNote: "Archivos de audio grandes (>25MB) y transcripciones de texto (.txt, .md) soportados.",
        dropZone: "Arrastra la grabación de la entrevista de captación aquí",
        dropZoneAlt: "o haz clic para buscar manualmente",
        disclaimer: "Esta herramienta evalúa comportamientos comerciales observables. No evalúa personalidad, talento ni predice resultados futuros.",
        readyToAnalyze: "Listo para analizar",
        startAnalysis: "Iniciar Análisis",
        transcribingPart: "Transcribiendo parte",
        of: "de",
        analyzingFull: "Analizando conversación completa con IA...",
        readingTextFile: "Leyendo archivo de texto...",
        loadingModel: "Cargando modelo local...",
        transcribing: "Transcribiendo...",
        fallingBack: "Error en local, usando API...",
        apiConfirmTitle: "Confirmar Uso de API",
        apiConfirmMessage: "La transcripción local falló o excedió el tiempo límite (10 min). ¿Deseas continuar usando la API de OpenAI? Esto puede tener costos asociados.",
        apiConfirmButton: "Sí, usar API",
        apiCancelButton: "Cancelar proceso",

        // Dimension Names
        agenda_control: "Agenda Control",
        commercial_authority: "Commercial Authority",
        seller_diagnosis: "Seller Diagnosis",
        objection_handling: "Objection Handling",
        value_proposition: "Value Proposition",
        process_closure: "Process Closure",
        discourse_consistency: "Discourse Consistency",

        // Sections
        executiveResult: "Resultado Ejecutivo",
        dimensionEvaluation: "Evaluación de Dimensiones",
        skillGapAnalysis: "Análisis de Brechas (Skill Gap)",
        trainingRecommendation: "Recomendación de Entrenamiento",
        brokerDecisionGuide: "Guía de Decisión para el Broker",
        observedEvidence: "Evidencia Observada",
        primaryWeakness: "Debilidad Primaria",
        observedPattern: "Patrón Observado",
        commercialImpact: "Impacto Comercial",
        priorityFocus: "Enfoque de Entrenamiento Prioritario",
        whatToTrain: "Qué entrenar",
        whatToObserve: "Qué observar en la próxima entrevista",
        suitableForTraining: "¿Apto para entrenamiento focalizado?",
        suitableForHighValue: "¿Apto para listings de alto valor?",
        recommendedReevaluation: "Reevaluación recomendada",

        // Classifications
        highRisk: "High Risk",
        trainablePotential: "Trainable Potential",
        reliableAgent: "Reliable Agent",

        // Export
        exportPDF: "Exportar PDF",
        exportMD: "Exportar Informe (MD)",
        exportTranscript: "Descargar Transcripción (TXT)",

        // Settings
        language: "Idioma",
    },
    en: {
        // Main page
        title: "Listing Interview Skill Evaluation",
        subtitleLine1: "Standardized evaluation of observable commercial skills during listing interviews.",
        subtitleLine2: "Upload a listing interview to receive a structured commercial skill assessment.",
        largeFileNote: "Large audio files (>25MB) and text transcripts (.txt, .md) supported.",
        dropZone: "Drop the listing interview recording here",
        dropZoneAlt: "or click to browse manually",
        disclaimer: "This tool evaluates observable commercial behaviors. It does not assess personality, talent, or predict future performance.",
        readyToAnalyze: "Ready to analyze",
        startAnalysis: "Start Analysis",
        transcribingPart: "Transcribing part",
        of: "of",
        analyzingFull: "Analyzing full conversation with AI...",
        readingTextFile: "Reading text file...",
        loadingModel: "Loading local model...",
        transcribing: "Transcribing...",
        fallingBack: "Local error, using API...",
        apiConfirmTitle: "Confirm API Usage",
        apiConfirmMessage: "Local transcription failed or timed out (10 min). Do you want to proceed using OpenAI's API? This may incur additional costs.",
        apiConfirmButton: "Yes, use API",
        apiCancelButton: "Cancel process",

        // Dimension Names
        agenda_control: "Agenda Control",
        commercial_authority: "Commercial Authority",
        seller_diagnosis: "Seller Diagnosis",
        objection_handling: "Objection Handling",
        value_proposition: "Value Proposition",
        process_closure: "Process Closure",
        discourse_consistency: "Discourse Consistency",

        // Sections
        executiveResult: "Executive Result",
        dimensionEvaluation: "Dimension Evaluation",
        skillGapAnalysis: "Skill Gap Analysis",
        trainingRecommendation: "Training Recommendation",
        brokerDecisionGuide: "Broker Decision Guide",
        observedEvidence: "Observed Evidence",
        primaryWeakness: "Primary Weakness",
        observedPattern: "Observed Pattern",
        commercialImpact: "Commercial Impact",
        priorityFocus: "Priority Training Focus",
        whatToTrain: "What to train",
        whatToObserve: "What to observe in next interview",
        suitableForTraining: "Suitable for focused training:",
        suitableForHighValue: "Suitable for high-value listings:",
        recommendedReevaluation: "Recommended re-evaluation:",

        // Classifications
        highRisk: "High Risk",
        trainablePotential: "Trainable Potential",
        reliableAgent: "Reliable Agent",

        // Export
        exportPDF: "Export PDF",
        exportMD: "Export Report (MD)",
        exportTranscript: "Download Transcript (TXT)",

        // Settings
        language: "Language",
    },
} as const;

export type TranslationKey = keyof typeof translations.es;
