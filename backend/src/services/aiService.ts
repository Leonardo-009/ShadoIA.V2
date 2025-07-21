import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateAIAnalysis(prompt: string, provider: string): Promise<{ text: string; usage?: any }> {
  if (provider !== "gemini") {
    throw new Error("Somente o provider 'gemini' está habilitado neste backend.")
  }
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "")
  const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  const result = await geminiModel.generateContent(prompt)
  const response = await result.response
  const text = response.text()
  return {
    text,
    usage: {
      promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
      completionTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: result.response.usageMetadata?.totalTokenCount || 0,
    }
  }
}
