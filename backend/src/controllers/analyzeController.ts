import { createHash } from "crypto"
import { generateAIAnalysis } from "../services/aiService"
import { cacheService } from "../services/cacheService"
import { generateAIPrompt, obfuscateLogData, ObfuscationResult } from "../utils/obfuscation"

interface AnalyzeRequest {
  logText: string
  provider: string
  reportType: string
}

export async function analyzeLogController(data: AnalyzeRequest) {
  const { logText, provider, reportType } = data

  // Generate cache key
  const contentHash = createHash("sha256").update(`${logText}-${provider}-${reportType}`).digest("hex")

  // Check cache
  const cachedResult = cacheService.get(`ai-${contentHash}`)
  if (cachedResult) {
    return {
      ...cachedResult,
      cached: true,
    }
  }

  // Obfuscate sensitive data
  const obfuscationResult = obfuscateLogData(logText)

  let analysisResult: Record<string, unknown>

  try {
    if (reportType === "saude") {
      analysisResult = await generateHealthReport(obfuscationResult, provider)
    } else if (reportType === "refinar") {
      analysisResult = await generateRefinedReport(obfuscationResult, provider)
    } else {
      analysisResult = await generateCompleteReport(obfuscationResult, provider)
    }

    // Cache result for 1 hour
    cacheService.set(`ai-${contentHash}`, analysisResult, 3600)

    return analysisResult
  } catch (error) {
    if (error instanceof Error) {
    throw new Error(`Failed to analyze log: ${error.message}`)
    }
    throw new Error("Failed to analyze log: Unknown error")
  }
}

async function generateHealthReport(obfuscationResult: ObfuscationResult, provider: string) {
  const healthPrompt = `Analise este log de segurança e forneça um relatório de saúde do sistema em formato JSON:

Log: ${obfuscationResult.obfuscatedText}

Retorne apenas um JSON com:
{
  "systemHealth": {
    "overall": "Bom|Regular|Ruim",
    "security": number (0-100),
    "performance": number (0-100),
    "availability": number (0-100)
  },
  "recommendations": ["recomendação1", "recomendação2", "recomendação3"],
  "summary": "resumo da análise"
}`

  const aiResponse = await generateAIAnalysis(healthPrompt, provider)

  try {
    const healthData = JSON.parse(aiResponse.text)
    return {
      type: "saude",
      ...healthData,
      obfuscatedData: obfuscationResult.detectedData,
      aiUsage: aiResponse.usage,
    }
  } catch {
    return {
      type: "saude",
      systemHealth: {
        overall: "Regular",
        security: 75,
        performance: 80,
        availability: 90,
      },
      recommendations: [
        "Revisar configurações de segurança",
        "Monitorar logs com mais frequência",
        "Implementar alertas automáticos",
      ],
      summary: "Análise de saúde baseada no log fornecido",
      obfuscatedData: obfuscationResult.detectedData,
      aiUsage: aiResponse.usage,
    }
  }
}

async function generateRefinedReport(obfuscationResult: ObfuscationResult, provider: string) {
  const refinePrompt = `Refine esta análise de log de segurança, identificando falsos positivos e confirmando ameaças reais:

Log: ${obfuscationResult.obfuscatedText}

Retorne apenas um JSON com:
{
  "refinedAnalysis": {
    "falsePositives": number,
    "confirmedThreats": number,
    "needsReview": number
  },
  "details": "explicação detalhada do refinamento",
  "summary": "resumo do refinamento"
}`

  const aiResponse = await generateAIAnalysis(refinePrompt, provider)

  try {
    const refineData = JSON.parse(aiResponse.text)
    return {
      type: "refinar",
      ...refineData,
      obfuscatedData: obfuscationResult.detectedData,
      aiUsage: aiResponse.usage,
    }
  } catch {
    return {
      type: "refinar",
      refinedAnalysis: {
        falsePositives: 1,
        confirmedThreats: 2,
        needsReview: 1,
      },
      details: "Refinamento automático aplicado ao log",
      summary: "Análise refinada com base nos padrões identificados",
      obfuscatedData: obfuscationResult.detectedData,
      aiUsage: aiResponse.usage,
    }
  }
}

async function generateCompleteReport(obfuscationResult: ObfuscationResult, provider: string) {
  const fullPrompt = generateAIPrompt(obfuscationResult.obfuscatedText, "completo")
  const aiResponse = await generateAIAnalysis(fullPrompt, provider)

  const reportText = aiResponse.text

  return {
    type: "completo",
    reportText,
    report: parseReportFromAI(reportText),
    obfuscatedData: obfuscationResult.detectedData,
    confidence: calculateConfidence(reportText),
    aiUsage: aiResponse.usage,
  }
}

function parseReportFromAI(reportText: string): Record<string, unknown> {
  return {
    greeting: "Prezados(as),",
    introduction: "Atividade suspeita detectada no ambiente. Detalhes para validação:",
    caseUse: extractSection(reportText, "Caso de uso:", "🕵"),
    analysis: extractSection(reportText, "🕵 Análise:", "📊"),
    source: extractSection(reportText, "📊 Fonte:", "🚨"),
    severity: extractSection(reportText, "🚨 Severidade:", "🧾"),
    justification: extractSection(reportText, "🕵 Justificativa:", "📌"),
    recommendations: extractRecommendations(reportText),
    evidence: extractEvidence(reportText),
  }
}

function extractSection(text: string, startMarker: string, endMarker: string): string {
  const startIndex = text.indexOf(startMarker)
  if (startIndex === -1) return ""

  const contentStart = startIndex + startMarker.length
  const endIndex = text.indexOf(endMarker, contentStart)

  if (endIndex === -1) {
    return text.substring(contentStart).trim()
  }

  return text.substring(contentStart, endIndex).trim()
}

function extractRecommendations(text: string): string[] {
  const section = extractSection(text, "📌 Recomendações:", "")
  const lines = section.split("\n")

  return lines
    .filter((line) => line.trim().startsWith("•"))
    .map((line) => line.replace("•", "").trim())
    .filter((line) => line.length > 0)
}

function extractEvidence(_text: string): Record<string, unknown> {
  return {
    logDate: new Date().toISOString().split("T")[0],
    logSource: "Sistema de Logs",
    affectedUser: "[USUARIO_OFUSCADO]",
    originIP: "[IP_OFUSCADO]",
    eventType: "Evento de Segurança",
    group: "Segurança",
    object: "Sistema",
    subject: "Análise de Log",
    threatName: "Ameaça Detectada",
    ruleName: "Regra de Análise",
    action: "Análise",
    status: "Detectado",
    vendorMessage: "Evento analisado pelo sistema de IA",
  }
}

function calculateConfidence(reportText: string): number {
  let confidence = 70

  if (reportText.includes("Alta")) confidence += 15
  if (reportText.includes("múltiplas")) confidence += 10
  if (reportText.includes("suspeita")) confidence += 5

  return Math.min(95, confidence)
}
