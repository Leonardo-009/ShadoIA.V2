export async function getHealthStatus() {
  try {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        ai: {
          providers: {
            openai: !!process.env.OPENAI_API_KEY,
            azure: !!(process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_API_KEY),
            anthropic: !!process.env.ANTHROPIC_API_KEY,
          },
        },
        threatIntelligence: {
          virustotal: !!process.env.VIRUSTOTAL_API_KEY,
          abuseipdb: !!process.env.ABUSEIPDB_API_KEY,
        },
      },
      version: "2.0.0",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || "development",
    }

    // Check if critical services are available
    const criticalServices = [
      health.services.ai.providers.openai,
      health.services.threatIntelligence.virustotal,
      health.services.threatIntelligence.abuseipdb,
    ]

    if (!criticalServices.some((service) => service)) {
      health.status = "degraded"
    }

    return health
  } catch (error) {
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    }
  }
}
