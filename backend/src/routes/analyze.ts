import express, { Router } from "express"
import { body } from "express-validator"
import { analyzeLogController } from "../controllers/analyzeController"
import { asyncHandler } from "../utils/asyncHandler"
import { generateAIPrompt, obfuscateLogData } from "../utils/obfuscation"

const router: Router = express.Router()

// Validation middleware
const validateAnalyzeRequest = [
  body("logText").isString().isLength({ min: 10 }).withMessage("Log text must be at least 10 characters"),
  body("provider").isIn(["openai", "azure", "anthropic", "gemini"]).withMessage("Invalid AI provider"),
  body("reportType").isIn(["completo", "saude", "refinar"]).withMessage("Invalid report type"),
]

// Test obfuscation endpoint
router.post("/test-obfuscation", asyncHandler(async (req, res) => {
  const { logText } = req.body
  
  if (!logText) {
    return res.status(400).json({ error: "logText is required" })
  }

  const obfuscationResult = obfuscateLogData(logText)
  
  return res.json({
    original: logText,
    obfuscated: obfuscationResult.obfuscatedText,
    detectedData: obfuscationResult.detectedData,
    obfuscationApplied: obfuscationResult.obfuscatedText !== logText
  })
}))

// Test AI prompt endpoint
router.post("/test-prompt", asyncHandler(async (req, res) => {
  const { logText, reportType = "completo" } = req.body
  
  if (!logText) {
    return res.status(400).json({ error: "logText is required" })
  }

  const obfuscationResult = obfuscateLogData(logText)
  const aiPrompt = generateAIPrompt(obfuscationResult.obfuscatedText, reportType)
  
  return res.json({
    original: logText,
    obfuscated: obfuscationResult.obfuscatedText,
    detectedData: obfuscationResult.detectedData,
    aiPrompt: aiPrompt,
    promptLength: aiPrompt.length,
    obfuscationApplied: obfuscationResult.obfuscatedText !== logText
  })
}))

// Main analyze endpoint
router.post("/", validateAnalyzeRequest, asyncHandler(async (req, res) => {
  const result = await analyzeLogController(req.body)
  if (!result) {
    return res.status(500).json({ error: "Erro ao analisar log" })
  }
  return res.json(result)
}))

export default router
