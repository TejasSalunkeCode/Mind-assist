import { chatWithAI, analyzeImage } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { messages, image, language } = await req.json();

    let response;
    if (image) {
      response = await analyzeImage(image, language);
    } else {
      response = await chatWithAI(messages, language);
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error("DEBUG: Chat API Error Details:", {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    return NextResponse.json(
      { error: "AI Service Error", details: error.message },
      { status: 500 }
    );
  }
}
