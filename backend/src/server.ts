import express, { Express } from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import dotenv from "dotenv"
import rateLimit from "express-rate-limit"

// Routes
import analyzeRoutes from "./routes/analyze"
import threatRoutes from "./routes/threats"
import healthRoutes from "./routes/health"
import cacheRoutes from "./routes/cache"

// Middleware
import { errorHandler } from "./middleware/errorHandler"
import { requestLogger } from "./middleware/requestLogger"

// Load environment variables
dotenv.config()

const app: Express = express()
const PORT = process.env.PORT || 3001

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
})
app.use("/api/", limiter)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Logging
app.use(morgan("combined"))
app.use(requestLogger)

// Health check (before rate limiting)
app.get("/", (req, res) => {
  res.json({
    name: "ShadoIA Backend API",
    version: "2.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
  })
})

// API Routes
app.use("/api/analyze", analyzeRoutes)
app.use("/api/threats", threatRoutes)
app.use("/api/health", healthRoutes)
app.use("/api/cache", cacheRoutes)

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.originalUrl,
    method: req.method,
  })
})

// Error handling middleware
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  // console.log(`🚀 ShadoIA Backend running on port ${PORT}`)
  // console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`)
  // console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || "http://localhost:3000"}`)
})

export default app
