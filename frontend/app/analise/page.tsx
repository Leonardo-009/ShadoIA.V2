"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Brain, CheckCircle, Copy, Eye, EyeOff, FileText, Shield } from "lucide-react"
import { useState } from "react"

export default function AnalysePage() {
  const [logText, setLogText] = useState("")
  const [provider, setProvider] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [showObfuscated, setShowObfuscated] = useState(false)
  const [obfuscationResult, setObfuscationResult] = useState<any>(null)
  const { toast } = useToast()
  const [reportType, setReportType] = useState("completo")

  const SAUDE_SIEM_PROMPT = `Você é um analista de segurança cibernética especializado em monitoramento e manutenção da saúde de sistemas SIEM. Sua tarefa é analisar o log fornecido, identificar possíveis problemas relacionados à saúde do SIEM (ex.: falhas na coleta de logs, atrasos, falsos positivos, regras mal configuradas, integrações inativas) e redigir um relatório claro, conciso e profissional para a equipe de manutenção do SIEM.

Instruções:
- Remova qualquer campo ou seção sem informação válida.
- Use linguagem técnica acessível, voltada para operação e sustentação de sistemas SIEM.

Modelo do Relatório:

Prezados(as), {saudacao}.

Nossa equipe identificou uma possível questão relacionada à saúde do SIEM que requer validação. Seguem abaixo mais detalhes para análise:

Caso de uso: [Descrição do caso de uso, ex.: "Verificar a integridade da coleta de logs para identificar falhas ou atrasos na ingestão de dados."]

🕵 Justificativa para abertura do caso: [Explicação do motivo pelo qual o log indica um problema, ex.: "O log mostra um atraso significativo na ingestão de dados, sugerindo problemas na integração com a fonte de dados."]

Objetivo do caso de uso: [Objetivo da análise, ex.: "Garantir que os logs sejam coletados em tempo real para evitar lacunas no monitoramento de segurança."]

📊 Fonte de dados utilizada na análise: [Fonte dos dados, ex.: "Windows Event Log", "Syslog"]

🧾 Evidências:
Data do Log: [Data e hora do evento]
Fonte do Log: [Sistema ou componente que gerou o log]
Usuário de Origem: [Usuário associado, se aplicável]
Usuário Afetado: [Usuário impactado, se aplicável]
IP/Host de Origem: [IP ou host que gerou o evento]
IP/Host Afetado: [IP ou host impactado]
Localização (Origem/Impactado): [Localização geográfica ou lógica, se disponível]
Tipo do Evento: [Tipo de evento, ex.: falha de integração]
Grupo: [Categoria do evento, ex.: saúde do SIEM]
Objeto: [Recurso alvo, ex.: conector]
Nome do Objeto: [Nome específico do recurso, ex.: Conector_Firewall_X]
Tipo do Objeto: [Tipo de recurso, ex.: conector]
Assunto: [Resumo do evento, ex.: falha na coleta de logs]
Política: [Política ou configuração relevante, se aplicável]
Nome da Ameaça: [Nome do problema, ex.: atraso na ingestão]
Nome do Processo: [Processo envolvido, ex.: ingestão de logs]
Nome da Regra MPE: [Regra que disparou o alerta, se aplicável]
Mensagem do Fornecedor: [Mensagem ou código de erro do sistema]
ID do Fornecedor: [Identificador único do evento, se disponível]
Identificador de Navegador: [User-agent, se aplicável]
Ação: [Ação relacionada, ex.: tentativa de coleta]
Status: [Status da ação, ex.: falha]
Resultado: [Resultado final, ex.: log não coletado]

Log: {log}

Gere o relatório EXATAMENTE no formato especificado, preenchendo todos os campos com base no log fornecido.`;

  const handleAnalyze = async () => {
    if (!logText.trim() || !provider) {
      toast({
        title: "Erro",
        description: "Por favor, insira o log e selecione um provedor de IA.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          logText,
          provider,
          reportType,
          prompt: reportType === "saude-siem" ? SAUDE_SIEM_PROMPT : undefined,
        }),
      })

      let result
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro na análise")
      } else {
        result = await response.json()
      }
      setAnalysisResult(result)
      setObfuscationResult(result.obfuscatedData)

      toast({
        title: "Análise Concluída",
        description: `Relatório Completo gerado com sucesso.`,
      })
    } catch (error) {
      console.error("Erro na análise:", error)
      toast({
        title: "Erro na Análise",
        description: error.message || "Falha ao processar a análise. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado",
      description: "Texto copiado para a área de transferência.",
    })
  }

  const generateReportText = (report: any) => {
    // Helper para mostrar apenas campos preenchidos
    const show = (label: string, value: any) => value ? `${label}: ${value}\n` : '';
    return `RELATÓRIO DE ANÁLISE DA EQUIPE DE MONITORAMENTO

Prezados(as), ${report.greeting}
Foi identificado atividade suspeita detectada pela equipe de monitoramento, no seu ambiente. Detalhes para validação:

🕵 Análise: ${report.analysis}

📊 Fonte: ${report.source}

🚨 Severidade: ${report.severity}

🧾 Evidências:
[Inclua apenas campos com informações disponíveis]
${show('Data do Log', report.evidence.logDate)}
${show('Fonte do Log', report.evidence.logSource)}
${show('Usuário de Origem', report.evidence.originUser)}
${show('Usuário Afetado', report.evidence.affectedUser)}
${show('IP/Host de Origem', report.evidence.originIP)}
${show('IP/Host Afetado', report.evidence.affectedIP)}
${show('Localização (Origem/Impactado)', report.evidence.location)}
${show('Tipo do Evento', report.evidence.eventType)}
${show('Grupo', report.evidence.group)}
${show('Objeto', report.evidence.object)}
${show('Nome do Objeto', report.evidence.objectName)}
${show('Tipo do Objeto', report.evidence.objectType)}
${show('Assunto', report.evidence.subject)}
${show('Política', report.evidence.policy)}
${show('Nome da Ameaça', report.evidence.threatName)}
${show('Nome do Processo', report.evidence.processName)}
${show('Nome da Regra MPE', report.evidence.ruleName)}
${show('Mensagem do Fornecedor', report.evidence.vendorMessage)}
${show('ID do Fornecedor', report.evidence.vendorId)}
${show('Identificador de Navegador', report.evidence.userAgent)}
${show('Ação', report.evidence.action)}
${show('Status', report.evidence.status)}
${show('Log', report.evidence.log)}

🕵 Justificativa: [Por que este evento merece atenção? Considere gravidade, contexto, recorrência, possíveis riscos e relação com políticas de segurança.]

📌 Recomendações:
${report.recommendations.map((rec: string) => `• ${rec}`).join("\n")}
`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Brain className="h-8 w-8 text-purple-600 mr-3" />
            Análise de Logs com IA
          </h1>
          <p className="text-muted-foreground mt-1">Analise logs de segurança com proteção automática de dados sensíveis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Entrada de Dados
                </CardTitle>
                <CardDescription>Cole o conteúdo do log para análise</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Cole aqui o conteúdo do log para análise..."
                  value={logText}
                  onChange={(e) => setLogText(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Provedor de IA</label>
                  <Select value={provider} onValueChange={setProvider}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o provedor de IA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini">Google Gemini</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de Relatório</label>
                  <RadioGroup value={reportType} onValueChange={setReportType}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="completo" id="completo" />
                      <label htmlFor="completo" className="text-sm">
                        Relatório Completo
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <RadioGroupItem value="saude-siem" id="saude-siem" />
                      <label htmlFor="saude-siem" className="text-sm">
                        Saúde de SIEM
                      </label>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !logText.trim() || !provider}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Brain className="h-4 w-4 mr-2 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Analisar Log
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Data Protection Info */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <Shield className="h-5 w-5 mr-2" />
                  Proteção de Dados Automática
                </CardTitle>
              </CardHeader>
              <CardContent className="text-green-700">
                <p className="text-sm mb-3">Dados detectados e ofuscados automaticamente antes do envio para IA:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>• IPs (IPv4/IPv6)</div>
                  <div>• Emails</div>
                  <div>• Usernames</div>
                  <div>• Domínios</div>
                  <div>• Hashes (MD5/SHA)</div>
                  <div>• Session IDs</div>
                </div>
                {obfuscationResult && (
                  <div className="mt-3 p-2 bg-green-100 rounded text-xs">
                    <strong>Dados detectados neste log:</strong>
                    <div className="mt-1">
                      {obfuscationResult?.ips?.length > 0 && <div>IPs: {obfuscationResult?.ips?.length}</div>}
                      {obfuscationResult?.emails?.length > 0 && <div>Emails: {obfuscationResult?.emails?.length}</div>}
                      {obfuscationResult?.users?.length > 0 && <div>Usuários: {obfuscationResult?.users?.length}</div>}
                      {obfuscationResult?.hashes?.length > 0 && <div>Hashes: {obfuscationResult?.hashes?.length}</div>}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {isAnalyzing && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2 animate-spin" />
                    Processando...
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Detectando dados sensíveis...</span>
                        <span>100%</span>
                      </div>
                      <Progress value={100} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Ofuscando informações...</span>
                        <span>100%</span>
                      </div>
                      <Progress value={100} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Enviando para IA...</span>
                        <span>75%</span>
                      </div>
                      <Progress value={75} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Gerando relatório...</span>
                        <span>45%</span>
                      </div>
                      <Progress value={45} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {analysisResult && analysisResult.type === "completo" && (
              <>
                {/* Relatório Completo */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center !text-purple-600 dark:!text-purple-400">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                      Relatório de Análise de Segurança
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Cabeçalho do Relatório */}
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm text-foreground">
                        <strong>{analysisResult.report.greeting}</strong>
                      </p>
                      <p className="text-sm mt-2 text-muted-foreground">{analysisResult.report.introduction}</p>
                    </div>

                    {/* Caso de Uso */}
                    <div>
                      <h4 className="font-semibold mb-2 !text-purple-600 dark:!text-purple-400">Caso de uso:</h4>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">{analysisResult.report.caseUse}</p>
                    </div>

                    {/* Análise */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center !text-purple-600 dark:!text-purple-400">🕵 Análise:</h4>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">{analysisResult.report.analysis}</p>
                    </div>

                    {/* Fonte */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center !text-purple-600 dark:!text-purple-400">📊 Fonte:</h4>
                      <p className="text-sm text-muted-foreground">{analysisResult.report.source}</p>
                    </div>

                    {/* Severidade */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center !text-purple-600 dark:!text-purple-400">🚨 Severidade:</h4>
                      <Badge variant="destructive" className="text-sm">
                        {analysisResult.report.severity}
                      </Badge>
                    </div>

                    {/* Evidências */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center !text-purple-600 dark:!text-purple-400">🧾 Evidências:</h4>
                      <div className="bg-muted p-4 rounded-lg space-y-3 text-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <strong>Data do Log:</strong> {analysisResult.report.evidence.logDate}
                          </div>
                          <div>
                            <strong>Fonte do Log:</strong> {analysisResult.report.evidence.logSource}
                          </div>
                          <div>
                            <strong>Usuário Afetado:</strong> {analysisResult.report.evidence.affectedUser}
                          </div>
                          <div>
                            <strong>IP/Host de Origem:</strong> {analysisResult.report.evidence.originIP}
                          </div>
                          <div>
                            <strong>Tipo do Evento:</strong> {analysisResult.report.evidence.eventType}
                          </div>
                          <div>
                            <strong>Grupo:</strong> {analysisResult.report.evidence.group}
                          </div>
                          <div>
                            <strong>Objeto:</strong> {analysisResult.report.evidence.object}
                          </div>
                          <div>
                            <strong>Assunto:</strong> {analysisResult.report.evidence.subject}
                          </div>
                          <div>
                            <strong>Nome da Ameaça:</strong> {analysisResult.report.evidence.threatName}
                          </div>
                          <div>
                            <strong>Nome da Regra MPE:</strong> {analysisResult.report.evidence.ruleName}
                          </div>
                          <div>
                            <strong>Ação:</strong> {analysisResult.report.evidence.action}
                          </div>
                          <div>
                            <strong>Status:</strong> {analysisResult.report.evidence.status}
                          </div>
                        </div>

                        <div className="mt-4">
                          <strong>Mensagem do Fornecedor:</strong>
                          <div className="bg-background p-3 rounded border mt-2 font-mono text-xs">
                            {analysisResult.report.evidence.vendorMessage}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Justificativa */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center !text-purple-600 dark:!text-purple-400">🕵 Justificativa:</h4>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                        {analysisResult.report.justification}
                      </p>
                    </div>

                    {/* Recomendações */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center !text-purple-600 dark:!text-purple-400">📌 Recomendações:</h4>
                      <div className="bg-muted p-4 rounded-lg">
                        <ul className="text-sm text-muted-foreground space-y-2">
                          {analysisResult.report.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Dados Protegidos */}
                    <Card className="border-green-200 bg-green-50">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between text-green-800">
                          <span className="flex items-center">
                            <Shield className="h-5 w-5 mr-2" />
                            Dados Protegidos ({Object.values(analysisResult.obfuscatedData).flat().length} itens)
                          </span>
                          <Button variant="outline" size="sm" onClick={() => setShowObfuscated(!showObfuscated)}>
                            {showObfuscated ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-green-700">
                        {showObfuscated ? (
                          <div className="space-y-2 text-sm">
                            {analysisResult.obfuscatedData.ips.length > 0 && (
                              <div>
                                <strong>IPs:</strong> {analysisResult.obfuscatedData.ips.join(", ")}
                              </div>
                            )}
                            {analysisResult.obfuscatedData.emails.length > 0 && (
                              <div>
                                <strong>Emails:</strong> {analysisResult.obfuscatedData.emails.join(", ")}
                              </div>
                            )}
                            {analysisResult.obfuscatedData.users.length > 0 && (
                              <div>
                                <strong>Usuários:</strong> {analysisResult.obfuscatedData.users.join(", ")}
                              </div>
                            )}
                            {analysisResult.obfuscatedData.hashes.length > 0 && (
                              <div>
                                <strong>Hashes:</strong> {analysisResult.obfuscatedData.hashes.join(", ")}
                              </div>
                            )}
                            {analysisResult.obfuscatedData.sessions.length > 0 && (
                              <div>
                                <strong>Sessions:</strong> {analysisResult.obfuscatedData.sessions.join(", ")}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm">
                            Clique no ícone do olho para visualizar os dados que foram ofuscados durante a análise.
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => copyToClipboard(generateReportText(analysisResult.report))}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Relatório
                      </Button>
                    </div>
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
