export interface ThreatIntelligenceResult {
  value: string
  status: "clean" | "suspicious" | "malicious"
  confidence: number
  threat_type?: string
  source: string
  detections?: number
  country?: string
  lastSeen?: string
  details?: any
}

export class ThreatIntelligenceService {
  private virusTotalApiKey: string
  private abuseIPDBApiKey: string

  constructor() {
    this.virusTotalApiKey = process.env.VIRUSTOTAL_API_KEY || ""
    this.abuseIPDBApiKey = process.env.ABUSEIPDB_API_KEY || ""
  }

  async checkVirusTotal(indicator: string, type: "ip" | "url" | "hash"): Promise<ThreatIntelligenceResult | null> {
    if (!this.virusTotalApiKey) {
      console.log("VirusTotal API key not configured, skipping VirusTotal check")
      return null
    }

    try {
      let endpoint = ""
      let encodedIndicator = indicator

      switch (type) {
        case "ip":
          endpoint = `https://www.virustotal.com/api/v3/ip_addresses/${indicator}`
          break
        case "url":
          encodedIndicator = Buffer.from(indicator).toString("base64").replace(/=/g, "")
          endpoint = `https://www.virustotal.com/api/v3/urls/${encodedIndicator}`
          break
        case "hash":
          endpoint = `https://www.virustotal.com/api/v3/files/${indicator}`
          break
      }

      const response = await fetch(endpoint, {
        headers: {
          "X-Apikey": this.virusTotalApiKey,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          return {
            value: indicator,
            status: "clean",
            confidence: 50,
            source: "VirusTotal",
            details: "Not found in database",
          }
        }
        throw new Error(`VirusTotal API error: ${response.status}`)
      }

      const data = await response.json() as any
      const stats = data.data.attributes.last_analysis_stats

      const malicious = stats.malicious || 0
      const suspicious = stats.suspicious || 0
      const total = malicious + suspicious + (stats.undetected || 0) + (stats.harmless || 0)

      let status: "clean" | "suspicious" | "malicious" = "clean"
      let confidence = 50

      if (malicious > 0) {
        status = "malicious"
        confidence = Math.min(95, 60 + (malicious / total) * 35)
      } else if (suspicious > 0) {
        status = "suspicious"
        confidence = Math.min(80, 40 + (suspicious / total) * 40)
      } else {
        // Para URLs limpas, a confiança deve ser baixa (indicando que é confiável)
        // Quanto mais análises harmless, menor a confiança (mais confiável)
        const harmlessRatio = (stats.harmless || 0) / total
        confidence = Math.max(10, 100 - (harmlessRatio * 100))
      }

      return {
        value: indicator,
        status,
        confidence: Math.round(confidence),
        source: "VirusTotal",
        detections: malicious + suspicious,
        country: data.data.attributes.country,
        lastSeen: data.data.attributes.last_seen,
        details: stats,
      }
    } catch {
      // console.error("VirusTotal query error:", error)
      return null
    }
  }

  async checkAbuseIPDB(ip: string): Promise<ThreatIntelligenceResult | null> {
    if (!this.abuseIPDBApiKey) {
      // console.log("AbuseIPDB API key not configured, skipping AbuseIPDB check")
      return null
    }

    try {
      const response = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90&verbose`, {
        headers: {
          Key: this.abuseIPDBApiKey,
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`AbuseIPDB API error: ${response.status}`)
      }

      const result = await response.json() as any
      const data = result.data

      let status: "clean" | "suspicious" | "malicious" = "clean"
      const abuseConfidence = data.abuseConfidenceScore

      if (abuseConfidence >= 75) {
        status = "malicious"
      } else if (abuseConfidence >= 25) {
        status = "suspicious"
      }

      return {
        value: ip,
        status,
        confidence: abuseConfidence,
        source: "AbuseIPDB",
        country: data.countryCode,
        lastSeen: data.lastReportedAt,
        details: {
          abuseConfidence,
          totalReports: data.totalReports,
          isPublic: data.isPublic,
        },
      }
    } catch {
      // console.error("AbuseIPDB query error:", error)
      return null
    }
  }

  async checkIndicator(indicator: string, type: "ip" | "url" | "hash"): Promise<ThreatIntelligenceResult[]> {
    const results: ThreatIntelligenceResult[] = []

    try {
      // Try VirusTotal first
      const vtResult = await this.checkVirusTotal(indicator, type)
      if (vtResult) {
        results.push(vtResult)
      }

      // For IPs, also try AbuseIPDB
      if (type === "ip") {
        const abuseResult = await this.checkAbuseIPDB(indicator)
        if (abuseResult) {
          results.push(abuseResult)
        }
      }

      // If no results from APIs, return a default clean result
      if (results.length === 0) {
        results.push({
          value: indicator,
          status: "clean",
          confidence: 50,
          source: "No APIs available",
          details: "No threat intelligence APIs configured",
        })
      }

      return results
    } catch {
      // console.error("Indicator check error:", error)
      // Return a default result on error
      return [{
        value: indicator,
        status: "clean",
        confidence: 50,
        source: "Error",
        details: "Error checking indicator",
      }]
    }
  }

  combineResults(results: ThreatIntelligenceResult[]): ThreatIntelligenceResult {
    if (results.length === 0) {
      throw new Error("No results to combine")
    }

    if (results.length === 1) {
      return results[0]
    }

    const maliciousResults = results.filter((r) => r.status === "malicious")
    const suspiciousResults = results.filter((r) => r.status === "suspicious")

    let finalStatus: "clean" | "suspicious" | "malicious" = "clean"
    let finalConfidence = 50
    const sources = results.map((r) => r.source).join(", ")

    if (maliciousResults.length > 0) {
      finalStatus = "malicious"
      finalConfidence = Math.max(...maliciousResults.map((r) => r.confidence))
    } else if (suspiciousResults.length > 0) {
      finalStatus = "suspicious"
      finalConfidence = Math.max(...suspiciousResults.map((r) => r.confidence))
    } else {
      finalConfidence = Math.max(...results.map((r) => r.confidence))
    }

    return {
      value: results[0].value,
      status: finalStatus,
      confidence: finalConfidence,
      source: sources,
      detections: Math.max(...results.map((r) => r.detections || 0)),
      country: results.find((r) => r.country)?.country,
      lastSeen: results.find((r) => r.lastSeen)?.lastSeen,
      details: results.map((r) => ({ source: r.source, ...r.details })),
    }
  }
}
