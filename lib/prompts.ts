import { Language } from "./translations";

export const analysisPrompts = {
    es: {
        systemRole: "Eres un experto Coach de Bienes Raíces. Analiza la siguiente transcripción de una entrevista entre un Agente y un Cliente Potencial Vendedor.",
        languageWarning: "⚠️ CRÍTICO: TODAS TUS RESPUESTAS DEBEN ESTAR COMPLETAMENTE EN ESPAÑOL. NUNCA USES INGLÉS.",
        criteria: `Debes evaluar al agente según qué tan bien descubrió estos puntos específicos:
      
1. Motivación (Por qué): "¿Por qué quiere mudarse?"
2. Objetivo (Para qué): "¿Para qué quiere mudarse?"
3. Plazo: "¿Cuándo tendría que estar mudado?"
4. Consecuencias: "¿Qué pasaría si no se muda?"
5. Decisor: "¿Quién toma la decisión final?"
6. Ubicación: "¿Dónde quiere mudarse?" (Lo primero que elige un comprador)
7. Liquidez/Presupuesto: "¿Con qué capital cuenta?"
8. Comodidades: "¿Qué comodidades le gustaría?"
9. Decisivas: "Si tuviera que elegir 1-2 comodidades decisivas"

REGLA ESPECIAL:
- Si el cliente menciona "PERMUTA", ¿el agente preguntó "Para qué quiere permutar?"? Si no lo hizo, penalización fuerte en Manejo de Objeciones.`,
        outputFormat: `FORMATO DE SALIDA (SOLO JSON, TODO EL TEXTO EN ESPAÑOL):
{
  "overall_score": 55,
  "phases": {
    "qualification": { 
       "score": 4, 
       "summary": "El agente intentó recopilar información básica sobre la propiedad pero omitió varias preguntas clave para la calificación completa del vendedor."
    },
    "trust_building": { "score": 8, "summary": "El agente construyó buena relación explicando el proceso de venta de manera clara y profesional." },
    "closing": { "score": 7, "summary": "El agente trabajó para asegurar un compromiso pero faltó profundizar en la motivación." }
  },
  "recommendations": ["Incorporar sistemáticamente las 9 Preguntas Doradas al inicio de la entrevista.", "Profundizar en la motivación emocional del cliente."],
  "action_plan": ["Practicar las preguntas clave hasta memorizarlas.", "Entrenarse en escucha activa para detectar señales emocionales."],
  "labeled_transcript": "NOTA: Para evitar errores, genera SOLO las primeras 10 líneas del diálogo etiquetado, formato: AGENTE: (texto). CLIENTE: (texto)."
}

IMPORTANTE: Asegúrate de que el campo labeled_transcript sea un string válido. Escapa comillas dobles con \\" y saltos de línea con \\n.`,
    },
    en: {
        systemRole: "You are an expert Real Estate Coach. Analyze the following interview transcript between an Agent and a Potential Seller.",
        languageWarning: "⚠️ CRITICAL: ALL YOUR RESPONSES MUST BE COMPLETELY IN ENGLISH. NEVER USE SPANISH.",
        criteria: `You must score the agent on how well they uncovered these specific points:
      
1. Motivation (Why): "Why do you want to move?"
2. Goal (What for): "What do you want to move for?"
3. Timeline: "When would you need to be moved?"
4. Consequences: "What would happen if you don't move?"
5. Decision Maker: "Who makes the final decision?"
6. Location: "Where do you want to move?" (The first thing a buyer chooses)
7. Liquidity/Budget: "What capital do you have available?"
8. Amenities: "What amenities would you like?"
9. Deal Breakers: "If you had to choose 1-2 decisive amenities"

SPECIAL RULE:
- If the client mentions "EXCHANGE/TRADE-IN", did the agent ask "What do you want to exchange for?"? If not, heavy penalty on Objection Handling.`,
        outputFormat: `OUTPUT FORMAT (JSON ONLY, ALL TEXT IN ENGLISH):
{
  "overall_score": 55,
  "phases": {
    "qualification": { 
       "score": 4, 
       "summary": "The agent attempted to gather basic information about the property but missed several key questions essential for full seller qualification."
    },
    "trust_building": { "score": 8, "summary": "The agent built good rapport by explaining the sales process clearly and professionally." },
    "closing": { "score": 7, "summary": "The agent worked towards securing a commitment but lacked depth in exploring motivation." }
  },
  "recommendations": ["Systematically incorporate the 9 Golden Questions at the beginning of the interview.", "Dig deeper into the client's emotional motivation."],
  "action_plan": ["Practice the key questions until memorized.", "Train on active listening to detect emotional signals."],
  "labeled_transcript": "NOTE: To avoid errors, generate ONLY the first 10 lines of labeled dialogue, format: AGENT: (text). CLIENT: (text)."
}

IMPORTANT: Ensure the labeled_transcript field is a valid string. Escape double quotes with \\" and newlines with \\n.`,
    },
};

export function buildAnalysisPrompt(language: Language): string {
    const prompt = analysisPrompts[language];

    return `
${prompt.systemRole}

${prompt.languageWarning}

${prompt.criteria}

${prompt.outputFormat}
  `.trim();
}
