import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const main = async (prompt) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `Based on the resume title "${prompt}", write a compelling and professional portfolio summary that highlights the candidate’s experience, key achievements, industry expertise, and soft skills.

    The tone should be confident, goal-oriented, and suitable for a modern portfolio website.
    Keep it between 30–70 words.

    Structure:
    Start with a strong introductory sentence.
    Mention experience in specific industries if applicable.
    End with a statement of value or career goal.

    Avoid listing bullet points; use natural flowing paragraphs.`,
  });
  return response.text;
};

export default main;
