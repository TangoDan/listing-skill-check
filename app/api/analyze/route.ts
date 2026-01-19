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
        const { transcript, language = "es" } = body;

        if (!transcript) {
            return NextResponse.json({ error: "No transcript provided" }, { status: 400 });
        }

        console.log("Analyzing full transcript length:", transcript.length);

        const { buildAnalysisPrompt } = await import("@/lib/prompts");
        const systemPrompt = buildAnalysisPrompt(language);

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
