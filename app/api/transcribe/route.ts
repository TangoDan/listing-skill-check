import { NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { writeFile, unlink } from "fs/promises";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
    let tempFilePath = "";
    try {
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: "OpenAI API Key is missing." },
                { status: 500 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Save temporary file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        tempFilePath = path.join(process.cwd(), `tmp_chunk_${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`);
        await writeFile(tempFilePath, buffer);

        console.log(`Transcribing chunk: ${tempFilePath} (${file.size} bytes)`);

        // Transcribe with Whisper
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tempFilePath),
            model: "whisper-1",
        });

        // Cleanup
        await unlink(tempFilePath);

        return NextResponse.json({ text: transcription.text });

    } catch (error: any) {
        console.error("Transcription Error:", error);
        // Attempt cleanup if failed
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            try { await unlink(tempFilePath); } catch (e) { }
        }
        return NextResponse.json(
            { error: error.message || "Failed to transcribe chunk" },
            { status: 500 }
        );
    }
}
