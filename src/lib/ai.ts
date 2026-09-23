import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function processLectureTranscript(transcript: string, subject?: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are an expert academic assistant. Process the following lecture transcript.
        1. Clean up "ums", "ahs", and background noise artifacts.
        2. Format it into comprehensive, well-structured study notes using Markdown.
        3. Create a concise summary of the key takeaways.
        4. Identify key definitions and formulas.

        Subject: ${subject || "General Lecture"}
        Transcript: ${transcript}
      `,
    });

    const result = response.text;
    
    // Simple parsing logic (could be more robust with structured output)
    const sections = result.split(/#+ (Summary|Notes|Definitions|Key Takeaways)/i);
    
    return {
      fullNotes: result,
      summary: result.substring(0, 500) + "...", // Fallback or extracted summary
    };
  } catch (error) {
    console.error("AI Processing Error:", error);
    throw error;
  }
}

export async function generateDeepSummary(notes: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Summarize these lecture notes into a brief, easy-to-read paragraph for a student's dashboard: ${notes}`,
  });
  return response.text;
}
