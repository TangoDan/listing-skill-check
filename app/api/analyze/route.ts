import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: "OpenAI API Key is missing." },
                { status: 500 }
            );
        }

        const body = await request.json();
        const { transcript } = body;

        if (!transcript) {
            return NextResponse.json({ error: "No transcript provided" }, { status: 400 });
        }

        console.log("Analyzing full transcript length:", transcript.length);

        // Analyze with GPT-4 (Golden Questions)
        const systemPrompt = `
      Eres un experto Coach de Bienes Raíces. Analiza la siguiente transcripción de una entrevista entre un Agente y un Cliente Potencial Vendedor.
      
      ⚠️ CRÍTICO: TODAS TUS RESPUESTAS DEBEN ESTAR COMPLETAMENTE EN ESPAÑOL. NUNCA USES INGLÉS.
      
      Debes evaluar al agente según qué tan bien descubrió estos puntos específicos:
      
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
      - Si el cliente menciona "PERMUTA", ¿el agente preguntó "Para qué quiere permutar?"? Si no lo hizo, penalización fuerte en Manejo de Objeciones.

      FORMATO DE SALIDA (SOLO JSON, TODO EL TEXTO EN ESPAÑOL):
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
      
      IMPORTANTE: Asegúrate de que el campo labeled_transcript sea un string válido. Escapa comillas dobles con \\" y saltos de línea con \\n.
    `;

        const analysis = await openai.chat.completions.create({
            model: "gpt-4o",
            temperature: 0.3,
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `TRANSCRIPCIÓN:\n${transcript}` },
            ],
        });

        const rawContent = analysis.choices[0].message.content || "{}";
        console.log("Raw AI response length:", rawContent.length);

        let result;
        try {
            result = JSON.parse(rawContent);
        } catch (parseError: any) {
            console.error("JSON Parse Error:", parseError.message);
            console.error("Problematic content (first 500 chars):", rawContent.substring(0, 500));

            // Fallback: return minimal valid response
            return NextResponse.json({
                error: "El análisis se completó pero hubo un problema con el formato de respuesta. Por favor, intenta de nuevo.",
                details: parseError.message
            }, { status: 500 });
        }

        result.transcript = transcript;

        return NextResponse.json(result);

    } catch (error: any) {
        console.error("Analysis Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to analyze transcript" },
            { status: 500 }
        );
    }
}
