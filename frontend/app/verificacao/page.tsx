"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { copyToClipboard } from "@/utils/copyToClipboard"; // Import copyToClipboard function
import { AlertTriangle, CheckCircle, Copy, Globe, Hash, Search, Shield, Wifi, XCircle } from "lucide-react"
import { useState } from "react"

export default function VerificacaoPage() {
  const [activeTab, setActiveTab] = useState("ip")
  const [inputData, setInputData] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResults, setVerificationResults] = useState<any>(null)
  const { toast } = useToast()

  const handleVerification = async () => {
    if (!inputData.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira os dados para verificação.",
        variant: "destructive",
      })
      return
    }

    const items = inputData.split("\n").filter((item) => item.trim())

    if (items.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhum item válido encontrado para verificação.",
        variant: "destructive",
      })
      return
    }

    if (items.length > 500) {
      toast({
        title: "Limite Excedido",
        description: "Máximo de 500 itens por verificação. Reduza a quantidade.",
        variant: "destructive",
      })
      return
    }

    setIsVerifying(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"}/api/threats/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items,
            type: activeTab,
          }),
        },
      )

      let results
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro na verificação")
      } else {
        results = await response.json()
      }
      setVerificationResults(results)

      toast({
        title: "Verificação Concluída",
        description: `${items.length} itens verificados com sucesso via VirusTotal e AbuseIPDB.`,
      })
    } catch (error) {
      console.error("Erro na verificação:", error)
      toast({
        title: "Erro na Verificação",
        description: error.message || "Falha ao verificar ameaças. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const generateReportText = (results: any) => {
    const currentDate = new Date().toLocaleString("pt-BR")

    return `RELATÓRIO DE VERIFICAÇÃO DE AMEAÇAS

Data: ${currentDate}
Gerado por: ShadoIA - Sistema de Análise de Segurança

═══════════════════════════════════════════════════════════════

📊 RESUMO EXECUTIVO

Total de itens verificados: ${results.total}
Tempo de processamento: ${results.summary.processingTime}
Fontes consultadas: ${results.summary.sources.join(", ")}

🚨 RESULTADOS POR CATEGORIA

• Maliciosos: ${results.malicious} (${((results.malicious / results.total) * 100).toFixed(1)}%)
• Suspeitos: ${results.suspicious} (${((results.suspicious / results.total) * 100).toFixed(1)}%)
• Limpos: ${results.clean} (${((results.clean / results.total) * 100).toFixed(1)}%)

═══════════════════════════════════════════════════════════════

🔍 ANÁLISE DETALHADA

${results.items
  .map(
    (item: any, index: number) => `
${index + 1}. ${item.value}
   Status: ${getStatusText(item.status).toUpperCase()}
   ${item.threat_type ? `Tipo de Ameaça: ${item.threat_type}` : ""}
   Confiança: ${item.confidence}%
   Fonte: ${item.source}
   ${item.detections > 0 ? `Detecções: ${item.detections}` : ""}
   ${item.country ? `País: ${item.country}` : ""}
   ${item.lastSeen ? `Última Atividade: ${item.lastSeen}` : ""}
`,
  )
  .join("")}

═══════════════════════════════════════════════════════════════

📌 RECOMENDAÇÕES

${
  results.malicious > 0
    ? `
🚨 AÇÃO IMEDIATA NECESSÁRIA:
• Bloquear imediatamente os ${results.malicious} itens identificados como maliciosos
• Investigar logs de acesso relacionados a esses indicadores
• Verificar se houve comprometimento nos sistemas que interagiram com esses recursos
`
    : ""
}

${
  results.suspicious > 0
    ? `
⚠️ MONITORAMENTO REFORÇADO:
• Implementar monitoramento adicional para os ${results.suspicious} itens suspeitos
• Configurar alertas para atividades relacionadas a esses indicadores
• Revisar periodicamente o status desses itens
`
    : ""
}

🛡️ MEDIDAS PREVENTIVAS:
• Manter listas de bloqueio atualizadas com os indicadores maliciosos
• Implementar verificação automática de reputação para novos indicadores
• Estabelecer processo de verificação regular de indicadores conhecidos
• Treinar equipe para reconhecer padrões de ameaças identificados

═══════════════════════════════════════════════════════════════

📋 INFORMAÇÕES TÉCNICAS

APIs Utilizadas:
• VirusTotal API v3 - Verificação de reputação e detecções
• AbuseIPDB API v2 - Análise de IPs maliciosos e relatórios de abuso

Critérios de Classificação:
• Malicioso: Múltiplas detecções em engines antivirus ou relatórios de abuso
• Suspeito: Poucas detecções ou atividade questionável reportada
• Limpo: Sem detecções ou relatórios negativos nas bases consultadas

═══════════════════════════════════════════════════════════════

Relatório gerado automaticamente pelo ShadoIA v2.0
Para mais informações, consulte a documentação técnica.
`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "malicious":
        return "destructive"
      case "suspicious":
        return "default"
      case "clean":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "malicious":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "suspicious":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "clean":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "malicious":
        return "Malicioso"
      case "suspicious":
        return "Suspeito"
      case "clean":
        return "Limpo"
      default:
        return "Desconhecido"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Search className="h-8 w-8 text-red-600 mr-3" />
            Verificação de Ameaças
          </h1>
          <p className="text-muted-foreground mt-1">Verifique IPs, URLs e Hashes via VirusTotal e AbuseIPDB (até 500 itens)</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados para Verificação</CardTitle>
                <CardDescription>Cole os dados para verificação (um item por linha)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="ip" className="flex items-center gap-2">
                      <Wifi className="h-4 w-4" />
                      IPs
                    </TabsTrigger>
                    <TabsTrigger value="url" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      URLs
                    </TabsTrigger>
                    <TabsTrigger value="hash" className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Hashes
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="ip" className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      <p>Exemplo de formato:</p>
                      <code className="bg-slate-100 p-2 rounded block mt-1">
                        8.8.8.8
                        <br />
                        1.1.1.1
                        <br />
                        8.8.4.4
                      </code>
                    </div>
                  </TabsContent>

                  <TabsContent value="url" className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      <p>Exemplo de formato:</p>
                      <code className="bg-slate-100 p-2 rounded block mt-1">
                        https://example.com
                        <br />
                        http://suspicious-site.com
                        <br />
                        https://malware-domain.net
                      </code>
                    </div>
                  </TabsContent>

                  <TabsContent value="hash" className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      <p>Exemplo de formato (MD5, SHA1, SHA256):</p>
                      <code className="bg-slate-100 p-2 rounded block mt-1">
                        d41d8cd98f00b204e9800998ecf8427e
                        <br />
                        da39a3ee5e6b4b0d3255bfef95601890afd80709
                        <br />
                        e3b0c44298fc1c149afbf4c8996fb924
                      </code>
                    </div>
                  </TabsContent>
                </Tabs>

                <Textarea
                  placeholder={`Cole aqui os ${activeTab === "ip" ? "IPs" : activeTab === "url" ? "URLs" : "Hashes"} para verificação (um por linha)...`}
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{inputData.split("\n").filter((item) => item.trim()).length} itens</span>
                  <span>Máximo: 500 itens</span>
                </div>

                <Button
                  onClick={handleVerification}
                  disabled={isVerifying || !inputData.trim()}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {isVerifying ? (
                    <>
                      <Search className="h-4 w-4 mr-2 animate-spin" />
                      Verificando via APIs...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Verificar Ameaças
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* API Info Card */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-800">
                  <Shield className="h-5 w-5 mr-2" />
                  APIs Integradas
                </CardTitle>
              </CardHeader>
              <CardContent className="text-blue-700">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>• VirusTotal API v3</span>
                    <Badge variant="outline" className="text-xs">
                      Ativo
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• AbuseIPDB API v2</span>
                    <Badge variant="outline" className="text-xs">
                      Ativo
                    </Badge>
                  </div>
                </div>
                <p className="text-xs mt-3 text-blue-600">
                  Verificação em tempo real com múltiplas fontes de threat intelligence
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {isVerifying && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Search className="h-5 w-5 mr-2 animate-spin" />
                    Verificando via APIs...
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Consultando VirusTotal...</span>
                        <span>100%</span>
                      </div>
                      <Progress value={100} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Consultando AbuseIPDB...</span>
                        <span>85%</span>
                      </div>
                      <Progress value={85} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Processando resultados...</span>
                        <span>60%</span>
                      </div>
                      <Progress value={60} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Gerando relatório...</span>
                        <span>30%</span>
                      </div>
                      <Progress value={30} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {verificationResults && (
              <>
                {/* Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center !text-purple-600 dark:!text-purple-400">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                      Resumo da Verificação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-foreground">{verificationResults.total}</div>
                        <div className="text-sm text-muted-foreground">Total</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-destructive">{verificationResults.malicious}</div>
                        <div className="text-sm text-destructive">Maliciosos</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-warning">{verificationResults.suspicious}</div>
                        <div className="text-sm text-warning">Suspeitos</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-success">{verificationResults.clean}</div>
                        <div className="text-sm text-success">Limpos</div>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground mb-4">
                      <p>
                        Processamento: {verificationResults.summary.processingTime} | APIs:{" "}
                        {verificationResults.summary.sources.join(", ")}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => copyToClipboard(generateReportText(verificationResults))}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Relatório
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Results */}
                <Card>
                  <CardHeader>
                    <CardTitle className="!text-purple-600 dark:!text-purple-400">Resultados Detalhados</CardTitle>
                    <CardDescription>Primeiros 10 resultados (total: {verificationResults.total})</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {verificationResults.items.map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(item.status)}
                            <div>
                              <p className="font-mono text-sm">{item.value}</p>
                              {item.threat_type && <p className="text-xs text-muted-foreground">{item.threat_type}</p>}
                              {item.country && <p className="text-xs text-muted-foreground">País: {item.country}</p>}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant={getStatusColor(item.status)}>{getStatusText(item.status)}</Badge>
                            <div className="text-right text-xs text-muted-foreground">
                              <div>
                                {item.confidence}% - {item.source}
                              </div>
                              {item.detections > 0 && <div>{item.detections} detecções</div>}
                              {item.lastSeen && <div>Visto: {item.lastSeen}</div>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {verificationResults.total > 10 && (
                      <div className="mt-4 text-center">
                        <Button variant="outline">Ver Todos os {verificationResults.total} Resultados</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
