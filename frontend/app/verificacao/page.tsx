"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { copyToClipboard } from "@/utils/copyToClipboard"; // Import copyToClipboard function
import {
  AlertTriangle,
  CheckCircle,
  Copy,
  ExternalLink,
  Globe,
  Hash,
  Search,
  Shield,
  Wifi,
  XCircle,
} from "lucide-react";
import { useState } from "react";

export default function VerificacaoPage() {
  const [activeTab, setActiveTab] = useState("ip");
  const [inputData, setInputData] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResults, setVerificationResults] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const { toast } = useToast();

  const handleVerification = async () => {
    if (!inputData.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira os dados para verificação.",
        variant: "destructive",
      });
      return;
    }

    const items = inputData.split("\n").filter((item) => item.trim());

    if (items.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhum item válido encontrado para verificação.",
        variant: "destructive",
      });
      return;
    }

    if (items.length > 500) {
      toast({
        title: "Limite Excedido",
        description:
          "Máximo de 500 itens por verificação. Reduza a quantidade.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
        }/api/threats/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items,
            type: activeTab,
          }),
        }
      );

      let results;
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro na verificação");
      } else {
        results = await response.json();
      }
      setVerificationResults(results);

      toast({
        title: "Verificação Concluída",
        description: `${items.length} itens verificados com sucesso via VirusTotal e AbuseIPDB.`,
      });
    } catch (error: any) {
      console.error("Erro na verificação:", error);
      toast({
        title: "Erro na Verificação",
        description:
          error.message || "Falha ao verificar ameaças. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const generateReportText = (results: any) => {
    const currentDate = new Date().toLocaleString("pt-BR");

    return `RELATÓRIO DE VERIFICAÇÃO DE AMEAÇAS

Data: ${currentDate}
Gerado por: ShadoIA - Sistema de Análise de Segurança

═══════════════════════════════════════════════════════════════

📊 RESUMO EXECUTIVO

Total de itens verificados: ${results.total}
Tempo de processamento: ${results.summary.processingTime}
Fontes consultadas: ${results.summary.sources.join(", ")}

🚨 RESULTADOS POR CATEGORIA

• Maliciosos: ${results.malicious} (${(
      (results.malicious / results.total) *
      100
    ).toFixed(1)}%)
• Suspeitos: ${results.suspicious} (${(
      (results.suspicious / results.total) *
      100
    ).toFixed(1)}%)
• Limpos: ${results.clean} (${((results.clean / results.total) * 100).toFixed(
      1
    )}%)

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
`
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
`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "malicious":
        return "destructive";
      case "suspicious":
        return "default";
      case "clean":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "malicious":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "suspicious":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "clean":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "malicious":
        return "Malicioso";
      case "suspicious":
        return "Suspeito";
      case "clean":
        return "Limpo";
      default:
        return "Desconhecido";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  // Função para filtrar os resultados detalhados
  const getFilteredItems = () => {
    if (!verificationResults) return [];
    if (!statusFilter) return verificationResults.items;
    return verificationResults.items.filter(
      (item: any) => item.status === statusFilter
    );
  };

  // Função para gerar links externos
  const getExternalLinks = (item: any) => {
    const links: { label: string; url: string }[] = [];
    if (activeTab === "ip") {
      links.push({
        label: "VirusTotal",
        url: `https://www.virustotal.com/gui/ip-address/${item.value}`,
      });
      links.push({
        label: "AbuseIPDB",
        url: `https://www.abuseipdb.com/check/${item.value}`,
      });
    } else if (activeTab === "url") {
      links.push({
        label: "VirusTotal",
        url: `https://www.virustotal.com/gui/url/search?query=${encodeURIComponent(
          item.value
        )}`,
      });
    } else if (activeTab === "hash") {
      links.push({
        label: "VirusTotal",
        url: `https://www.virustotal.com/gui/file/${item.value}`,
      });
    }
    return links;
  };

  // Função para limpar pesquisa
  const handleClear = () => {
    setInputData("");
    setVerificationResults(null);
    setStatusFilter(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Search className="h-8 w-8 text-red-600 mr-3" />
            Verificação de Ameaças
          </h1>
          <p className="text-muted-foreground mt-1">
            Verifique IPs, URLs e Hashes via VirusTotal e AbuseIPDB (até 500
            itens)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados para Verificação</CardTitle>
                <CardDescription>
                  Cole os dados para verificação (um item por linha)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="ip" className="flex items-center gap-2">
                      <Wifi className="h-4 w-4" />
                      IPs
                    </TabsTrigger>
                    <TabsTrigger
                      value="url"
                      className="flex items-center gap-2"
                    >
                      <Globe className="h-4 w-4" />
                      URLs
                    </TabsTrigger>
                    <TabsTrigger
                      value="hash"
                      className="flex items-center gap-2"
                    >
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
                  placeholder={`Cole aqui os ${
                    activeTab === "ip"
                      ? "IPs"
                      : activeTab === "url"
                      ? "URLs"
                      : "Hashes"
                  } para verificação (um por linha)...`}
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {inputData.split("\n").filter((item) => item.trim()).length}{" "}
                    itens
                  </span>
                  <span>Máximo: 500 itens</span>
                </div>

                <div className="flex gap-2">
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
                  <Button
                    onClick={handleClear}
                    variant="outline"
                    className="w-full"
                    disabled={isVerifying && !inputData.trim()}
                  >
                    Limpar
                  </Button>
                </div>
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
                    <Badge className="text-xs bg-green-600 text-white border-none">
                      Ativo
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• AbuseIPDB API v2</span>
                    <Badge className="text-xs bg-green-600 text-white border-none">
                      Ativo
                    </Badge>
                  </div>
                </div>
                <p className="text-xs mt-3 text-blue-600">
                  Verificação em tempo real com múltiplas fontes de threat
                  intelligence
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div
                        className={`text-center p-4 bg-muted rounded-lg border-2 border-blue-200 cursor-pointer ${
                          statusFilter === null ? "ring-2 ring-blue-400" : ""
                        }`}
                        onClick={() => setStatusFilter(null)}
                      >
                        <div className="text-3xl font-bold text-blue-600">
                          {verificationResults.total}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Verificado
                        </div>
                      </div>
                      <div
                        className={`text-center p-4 bg-muted rounded-lg border-2 border-red-200 cursor-pointer ${
                          statusFilter === "malicious"
                            ? "ring-2 ring-red-400"
                            : ""
                        }`}
                        onClick={() => setStatusFilter("malicious")}
                      >
                        <div className="text-3xl font-bold text-red-600">
                          {verificationResults.malicious}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Maliciosos
                        </div>
                        <div className="text-xs text-red-500 mt-1">
                          {(
                            (verificationResults.malicious /
                              verificationResults.total) *
                            100
                          ).toFixed(1)}
                          %
                        </div>
                      </div>
                      <div
                        className={`text-center p-4 bg-muted rounded-lg border-2 border-yellow-200 cursor-pointer ${
                          statusFilter === "suspicious"
                            ? "ring-2 ring-yellow-400"
                            : ""
                        }`}
                        onClick={() => setStatusFilter("suspicious")}
                      >
                        <div className="text-3xl font-bold text-yellow-600">
                          {verificationResults.suspicious}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Suspeitos
                        </div>
                        <div className="text-xs text-yellow-500 mt-1">
                          {(
                            (verificationResults.suspicious /
                              verificationResults.total) *
                            100
                          ).toFixed(1)}
                          %
                        </div>
                      </div>
                      <div
                        className={`text-center p-4 bg-muted rounded-lg border-2 border-green-200 cursor-pointer ${
                          statusFilter === "clean"
                            ? "ring-2 ring-green-400"
                            : ""
                        }`}
                        onClick={() => setStatusFilter("clean")}
                      >
                        <div className="text-3xl font-bold text-green-600">
                          {verificationResults.clean}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Limpos
                        </div>
                        <div className="text-xs text-green-500 mt-1">
                          {(
                            (verificationResults.clean /
                              verificationResults.total) *
                            100
                          ).toFixed(1)}
                          %
                        </div>
                      </div>
                    </div>
                    {statusFilter !== null && (
                      <div className="mb-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setStatusFilter(null)}
                        >
                          Mostrar Todos
                        </Button>
                      </div>
                    )}

                    {/* Estatísticas adicionais */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium text-blue-800">
                            Tempo de Processamento
                          </span>
                        </div>
                        <div className="text-lg font-bold text-blue-600 mt-1">
                          {verificationResults.summary.processingTime}
                        </div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-sm font-medium text-purple-800">
                            APIs Consultadas
                          </span>
                        </div>
                        <div className="text-sm text-purple-600 mt-1">
                          {verificationResults.summary.sources.join(", ")}
                        </div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-800">
                            Taxa de Segurança
                          </span>
                        </div>
                        <div className="text-lg font-bold text-green-600 mt-1">
                          {(
                            (verificationResults.clean /
                              verificationResults.total) *
                            100
                          ).toFixed(1)}
                          %
                        </div>
                      </div>
                    </div>

                    {/* Alertas baseados nos resultados */}
                    {verificationResults.malicious > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          <h4 className="font-semibold text-red-800">
                            🚨 Alerta de Segurança
                          </h4>
                        </div>
                        <p className="text-sm text-red-700">
                          {verificationResults.malicious} indicador
                          {verificationResults.malicious > 1 ? "es" : ""}{" "}
                          malicioso
                          {verificationResults.malicious > 1 ? "s" : ""}{" "}
                          detectado
                          {verificationResults.malicious > 1 ? "s" : ""}. Ação
                          imediata recomendada.
                        </p>
                      </div>
                    )}

                    {verificationResults.suspicious > 0 &&
                      verificationResults.malicious === 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            <h4 className="font-semibold text-yellow-800">
                              ⚠️ Monitoramento Necessário
                            </h4>
                          </div>
                          <p className="text-sm text-yellow-700">
                            {verificationResults.suspicious} indicador
                            {verificationResults.suspicious > 1 ? "es" : ""}{" "}
                            suspeito
                            {verificationResults.suspicious > 1 ? "s" : ""}{" "}
                            identificado
                            {verificationResults.suspicious > 1 ? "s" : ""}.
                            Monitoramento adicional recomendado.
                          </p>
                        </div>
                      )}

                    {verificationResults.clean ===
                      verificationResults.total && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <h4 className="font-semibold text-green-800">
                            ✅ Todos os Indicadores Seguros
                          </h4>
                        </div>
                        <p className="text-sm text-green-700">
                          Todos os {verificationResults.total} indicadores
                          verificados estão limpos. Nenhuma ameaça detectada.
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() =>
                          copyToClipboard(
                            generateReportText(verificationResults)
                          )
                        }
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
                    <CardTitle className="!text-purple-600 dark:!text-purple-400">
                      Resultados Detalhados
                    </CardTitle>
                    <CardDescription>
                      {statusFilter === null
                        ? `Primeiros 10 resultados (total: ${verificationResults.total})`
                        : `Primeiros 10 resultados (${getStatusText(
                            statusFilter
                          )}) (total: ${getFilteredItems().length})`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {getFilteredItems()
                        .slice(0, 10)
                        .map((item: any, index: number) => (
                          <Card
                            key={index}
                            className="border-l-4"
                            style={{
                              borderLeftColor:
                                item.status === "malicious"
                                  ? "#ef4444"
                                  : item.status === "suspicious"
                                  ? "#f59e0b"
                                  : "#10b981",
                            }}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  {getStatusIcon(item.status)}
                                  <div>
                                    <h4 className="font-mono text-lg font-semibold">
                                      {item.value}
                                    </h4>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <Badge
                                        variant={getStatusColor(item.status)}
                                        className="text-xs"
                                      >
                                        {getStatusText(
                                          item.status
                                        ).toUpperCase()}
                                      </Badge>
                                      {item.country && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          🌍 {item.country}
                                        </Badge>
                                      )}
                                      {/* Links externos */}
                                      {getExternalLinks(item).map((link, i) => (
                                        <a
                                          key={i}
                                          href={link.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="ml-1 text-blue-600 hover:underline flex items-center"
                                          title={`Ver no ${link.label}`}
                                        >
                                          <ExternalLink className="h-4 w-4" />
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div
                                    className="text-2xl font-bold"
                                    style={{
                                      color:
                                        item.status === "malicious"
                                          ? "#ef4444"
                                          : item.status === "suspicious"
                                          ? "#f59e0b"
                                          : "#10b981",
                                    }}
                                  >
                                    {item.status === "clean"
                                      ? "✅"
                                      : item.status === "suspicious"
                                      ? "⚠️"
                                      : "🚨"}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {getStatusText(item.status).toUpperCase()}
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                      Fonte:
                                    </span>
                                    <span className="font-medium">
                                      {item.source}
                                    </span>
                                  </div>
                                  {item.detections !== undefined &&
                                    item.detections > 0 && (
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                          Detecções:
                                        </span>
                                        <span className="font-medium text-red-600">
                                          {item.detections}
                                        </span>
                                      </div>
                                    )}
                                  {item.threat_type && (
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">
                                        Tipo de Ameaça:
                                      </span>
                                      <span className="font-medium text-orange-600">
                                        {item.threat_type}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  {item.lastSeen && (
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">
                                        Última Atividade:
                                      </span>
                                      <span className="font-medium">
                                        {formatDate(item.lastSeen)}
                                      </span>
                                    </div>
                                  )}
                                  {item.details &&
                                    item.details.totalReports && (
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                          Total de Relatórios:
                                        </span>
                                        <span className="font-medium">
                                          {item.details.totalReports}
                                        </span>
                                      </div>
                                    )}
                                  {item.details &&
                                    item.details.abuseConfidence && (
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                          Score de Abuso:
                                        </span>
                                        <span className="font-medium">
                                          {item.details.abuseConfidence}%
                                        </span>
                                      </div>
                                    )}
                                </div>
                              </div>

                              {/* Scores das APIs */}
                              <div className="bg-muted p-3 rounded-lg mb-3">
                                <h5 className="text-sm font-semibold mb-2">
                                  📊 Scores das APIs:
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                  {/* VirusTotal Scores */}
                                  {(item.details?.vt_malicious_score !==
                                    undefined ||
                                    item.details?.vt_suspicious_score !==
                                      undefined ||
                                    item.details?.vt_harmless_score !==
                                      undefined) && (
                                    <div className="space-y-2">
                                      <div className="font-medium text-blue-600">
                                        🛡️ VirusTotal:
                                      </div>
                                      {item.details.vt_malicious_score !==
                                        undefined && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">
                                            Maliciosos:
                                          </span>
                                          <span className="font-medium text-red-600">
                                            {item.details.vt_malicious_score}
                                          </span>
                                        </div>
                                      )}
                                      {item.details.vt_suspicious_score !==
                                        undefined && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">
                                            Suspeitos:
                                          </span>
                                          <span className="font-medium text-yellow-600">
                                            {item.details.vt_suspicious_score}
                                          </span>
                                        </div>
                                      )}
                                      {item.details.vt_harmless_score !==
                                        undefined && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">
                                            Seguros:
                                          </span>
                                          <span className="font-medium text-green-600">
                                            {item.details.vt_harmless_score}
                                          </span>
                                        </div>
                                      )}
                                      {item.details.vt_total_engines !==
                                        undefined && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">
                                            Total Engines:
                                          </span>
                                          <span className="font-medium">
                                            {item.details.vt_total_engines}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* AbuseIPDB Score */}
                                  {item.details?.abuse_score !== undefined && (
                                    <div className="space-y-2">
                                      <div className="font-medium text-purple-600">
                                        🛡️ AbuseIPDB:
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Score de Abuso:
                                        </span>
                                        <span
                                          className="font-medium"
                                          style={{
                                            color:
                                              item.details.abuse_score >= 75
                                                ? "#ef4444"
                                                : item.details.abuse_score >= 25
                                                ? "#f59e0b"
                                                : "#10b981",
                                          }}
                                        >
                                          {item.details.abuse_score}%
                                        </span>
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {item.details.abuse_score >= 75
                                          ? "Alto risco"
                                          : item.details.abuse_score >= 25
                                          ? "Risco moderado"
                                          : "Baixo risco"}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Detalhes adicionais do VirusTotal */}
                              {item.details &&
                                item.details.last_analysis_stats && (
                                  <div className="bg-muted p-3 rounded-lg mb-3">
                                    <h5 className="text-sm font-semibold mb-2">
                                      📊 Análise VirusTotal:
                                    </h5>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                      {item.details.last_analysis_stats
                                        .malicious > 0 && (
                                        <div className="text-center p-2 bg-red-100 rounded">
                                          <div className="font-bold text-red-700">
                                            {
                                              item.details.last_analysis_stats
                                                .malicious
                                            }
                                          </div>
                                          <div className="text-red-600">
                                            Maliciosos
                                          </div>
                                        </div>
                                      )}
                                      {item.details.last_analysis_stats
                                        .suspicious > 0 && (
                                        <div className="text-center p-2 bg-yellow-100 rounded">
                                          <div className="font-bold text-yellow-700">
                                            {
                                              item.details.last_analysis_stats
                                                .suspicious
                                            }
                                          </div>
                                          <div className="text-yellow-600">
                                            Suspeitos
                                          </div>
                                        </div>
                                      )}
                                      {item.details.last_analysis_stats
                                        .harmless > 0 && (
                                        <div className="text-center p-2 bg-green-100 rounded">
                                          <div className="font-bold text-green-700">
                                            {
                                              item.details.last_analysis_stats
                                                .harmless
                                            }
                                          </div>
                                          <div className="text-green-600">
                                            Seguros
                                          </div>
                                        </div>
                                      )}
                                      {item.details.last_analysis_stats
                                        .undetected > 0 && (
                                        <div className="text-center p-2 bg-gray-100 rounded">
                                          <div className="font-bold text-gray-700">
                                            {
                                              item.details.last_analysis_stats
                                                .undetected
                                            }
                                          </div>
                                          <div className="text-gray-600">
                                            Não Detectados
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                              {/* Detalhes adicionais do AbuseIPDB */}
                              {item.details && item.details.abuseIPDB && (
                                <div className="bg-muted p-3 rounded-lg mb-3">
                                  <h5 className="text-sm font-semibold mb-2">
                                    🛡️ Análise AbuseIPDB:
                                  </h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                    {item.details.abuseIPDB.isp && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          ISP:
                                        </span>
                                        <span className="font-medium">
                                          {item.details.abuseIPDB.isp}
                                        </span>
                                      </div>
                                    )}
                                    {item.details.abuseIPDB.domain && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Domínio:
                                        </span>
                                        <span className="font-medium">
                                          {item.details.abuseIPDB.domain}
                                        </span>
                                      </div>
                                    )}
                                    {item.details.abuseIPDB.usageType && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Tipo de Uso:
                                        </span>
                                        <span className="font-medium">
                                          {item.details.abuseIPDB.usageType}
                                        </span>
                                      </div>
                                    )}
                                    {item.details.abuseIPDB.isPublic !==
                                      undefined && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          IP Público:
                                        </span>
                                        <span className="font-medium">
                                          {item.details.abuseIPDB.isPublic
                                            ? "Sim"
                                            : "Não"}
                                        </span>
                                      </div>
                                    )}
                                    {item.details.abuseIPDB.totalReports >
                                      0 && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Total de Relatórios:
                                        </span>
                                        <span className="font-medium text-red-600">
                                          {item.details.abuseIPDB.totalReports}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Informações geográficas */}
                              {(item.details?.virusTotal?.city ||
                                item.details?.virusTotal?.continent ||
                                item.details?.virusTotal?.as_owner) && (
                                <div className="bg-muted p-3 rounded-lg mb-3">
                                  <h5 className="text-sm font-semibold mb-2">
                                    🌍 Informações Geográficas:
                                  </h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                    {item.details.virusTotal.city && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Cidade:
                                        </span>
                                        <span className="font-medium">
                                          {item.details.virusTotal.city}
                                        </span>
                                      </div>
                                    )}
                                    {item.details.virusTotal.continent && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Continente:
                                        </span>
                                        <span className="font-medium">
                                          {item.details.virusTotal.continent}
                                        </span>
                                      </div>
                                    )}
                                    {item.details.virusTotal.as_owner && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Proprietário AS:
                                        </span>
                                        <span className="font-medium">
                                          {item.details.virusTotal.as_owner}
                                        </span>
                                      </div>
                                    )}
                                    {item.details.virusTotal.reputation !==
                                      undefined && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Reputação:
                                        </span>
                                        <span className="font-medium">
                                          {item.details.virusTotal.reputation}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Recomendações baseadas no status */}
                              <div className="bg-muted p-3 rounded-lg">
                                <h5 className="text-sm font-semibold mb-2">
                                  💡 Recomendações:
                                </h5>
                                <div className="text-xs space-y-1">
                                  {item.status === "malicious" && (
                                    <div className="text-red-700">
                                      🚨 <strong>Ação Imediata:</strong>{" "}
                                      Bloquear este indicador imediatamente.
                                      Investigar logs de acesso e verificar
                                      comprometimento.
                                    </div>
                                  )}
                                  {item.status === "suspicious" && (
                                    <div className="text-yellow-700">
                                      ⚠️ <strong>Monitoramento:</strong>{" "}
                                      Implementar monitoramento adicional e
                                      configurar alertas para atividades
                                      relacionadas.
                                    </div>
                                  )}
                                  {item.status === "clean" && (
                                    <div className="text-green-700">
                                      ✅ <strong>Seguro:</strong> Este indicador
                                      não apresenta ameaças conhecidas. Manter
                                      monitoramento padrão.
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                    {getFilteredItems().length > 10 && (
                      <div className="mt-6 text-center">
                        <Button variant="outline" className="w-full">
                          Ver Todos os {getFilteredItems().length} Resultados
                        </Button>
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
  );
}
