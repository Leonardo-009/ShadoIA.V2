// Utilitário para ofuscação de dados sensíveis
export interface ObfuscationResult {
  obfuscatedText: string
  detectedData: {
    ips: string[]
    emails: string[]
    users: string[]
    domains: string[]
    hashes: string[]
    sessions: string[]
  }
}

export function obfuscateLogData(logText: string): ObfuscationResult {
  let obfuscatedText = logText
  const detectedData = {
    ips: [] as string[],
    emails: [] as string[],
    users: [] as string[],
    domains: [] as string[],
    hashes: [] as string[],
    sessions: [] as string[],
  }

  // Regex patterns para detecção
  const patterns = {
    // IPs (IPv4 e IPv6)
    ipv4: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    ipv6: /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/g,

    // Emails
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,

    // Usernames (padrões comuns)
    username: /\b(?:user|username|account|login|logon)[\s:=]+([a-zA-Z0-9._-]+)\b/gi,

    // Domínios
    domain: /\b[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.([a-zA-Z]{2,})\b/g,

    // Hashes (MD5, SHA1, SHA256)
    hash: /\b[a-fA-F0-9]{32}\b|\b[a-fA-F0-9]{40}\b|\b[a-fA-F0-9]{64}\b/g,

    // Session IDs
    session: /\b(?:session|sess|sid)[\s:=]+([a-zA-Z0-9._-]+)\b/gi,

    // Hostnames
    hostname: /\b(?:host|hostname|computer)[\s:=]+([a-zA-Z0-9._-]+)\b/gi,
  }

  // Detectar e ofuscar IPs
  const ipMatches = [...logText.matchAll(patterns.ipv4), ...logText.matchAll(patterns.ipv6)]
  ipMatches.forEach((match) => {
    if (match[0] && !detectedData.ips.includes(match[0])) {
      detectedData.ips.push(match[0])
      obfuscatedText = obfuscatedText.replace(new RegExp(escapeRegex(match[0]), "g"), "[IP_OFUSCADO]")
    }
  })

  // Detectar e ofuscar emails
  const emailMatches = [...logText.matchAll(patterns.email)]
  emailMatches.forEach((match) => {
    if (match[0] && !detectedData.emails.includes(match[0])) {
      detectedData.emails.push(match[0])
      obfuscatedText = obfuscatedText.replace(new RegExp(escapeRegex(match[0]), "g"), "[EMAIL_OFUSCADO]")
    }
  })

  // Detectar e ofuscar usernames
  const userMatches = [...logText.matchAll(patterns.username)]
  userMatches.forEach((match) => {
    if (match[1] && !detectedData.users.includes(match[1])) {
      detectedData.users.push(match[1])
      obfuscatedText = obfuscatedText.replace(new RegExp(escapeRegex(match[1]), "g"), "[USUARIO_OFUSCADO]")
    }
  })

  // Detectar e ofuscar hashes
  const hashMatches = [...logText.matchAll(patterns.hash)]
  hashMatches.forEach((match) => {
    if (match[0] && !detectedData.hashes.includes(match[0])) {
      detectedData.hashes.push(match[0])
      obfuscatedText = obfuscatedText.replace(new RegExp(escapeRegex(match[0]), "g"), "[HASH_OFUSCADO]")
    }
  })

  // Detectar e ofuscar sessions
  const sessionMatches = [...logText.matchAll(patterns.session)]
  sessionMatches.forEach((match) => {
    if (match[1] && !detectedData.sessions.includes(match[1])) {
      detectedData.sessions.push(match[1])
      obfuscatedText = obfuscatedText.replace(new RegExp(escapeRegex(match[1]), "g"), "[SESSION_OFUSCADA]")
    }
  })

  return {
    obfuscatedText,
    detectedData,
  }
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// Função para gerar o prompt da IA com dados ofuscados
export function generateAIPrompt(obfuscatedLog: string, reportType: string): string {
  const basePrompt = `Você é um analista de segurança cibernética. Analise o log e gere um relatório profissional no formato exato abaixo. Preencha apenas os campos disponíveis no log. Se não disponível no log, não traga no relatório. Use linguagem objetiva e evite jargões excessivos.

Instruções IMPORTANTES:
1. Remova do Evidências todos os "não disponíveis".
2. Para as recomendações, liste cada item com um bullet point (•) em uma linha separada, SEM números.
3. Remova completamente qualquer seção que não tenha informações válidas.

Caso de uso: Descreva o evento (ex.: falha de login, acesso não autorizado) com base no log.
Análise: Forneça uma análise técnica detalhada, incluindo contexto (tipo de evento), impacto potencial (ex.: interrupção de serviço) e implicações.
Objetivo do caso de uso: Especifique o objetivo da análise (ex.: detectar intrusões, identificar falhas de autenticação).
Fonte de dados: Use "Windows Event Log" para logs XML ou "Syslog" para logs Syslog. Se não identificável, não traga o campo.
Justificativa: Explique por que o evento justifica investigação, considerando gravidade, tipo de evento, número de tentativas (se aplicável) e impacto potencial (ex.: comprometimento de credenciais).
Recomendações: Liste 3 ações práticas e acionáveis para mitigar o evento e prevenir recorrências, alinhadas com padrões como NIST ou CIS Controls.
Resultado: Derive do campo 'message' (ex.: "Failed" para "Login failed") ou não traga o campo se não aplicável.
Status: Não traga o campo, a menos que o log forneça um campo 'status' explícito.

Modelo:
Prezados(as), {saudacao}.
Atividade suspeita detectada, no ambiente. Detalhes para validação:

Caso de uso: [Descreva o evento com base no log]
🕵 Análise: [Forneça uma análise técnica do evento]
📊 Fonte: [Identifique a fonte do log, ex.: Windows Event Log, Syslog]
🚨 Severidade: [Classifique a severidade, ex.: Baixa, Moderada, Alta]
🧾 Evidências:
[Inclua apenas campos com informações disponíveis]
Data do Log: [Data e hora do evento]
Fonte do Log: [Sistema ou componente que gerou o log]
Usuário de Origem: [Usuário que iniciou a atividade, se aplicável]
Usuário Afetado: [Usuário impactado, se aplicável]
IP/Host de Origem: [IP ou host que iniciou a atividade]
IP/Host Afetado: [IP ou host impactado]
Localização (Origem/Impactado): [Localização geográfica ou lógica, se disponível]
Tipo do Evento: [Tipo de evento, ex.: acesso não autorizado]
Grupo: [Categoria do evento, ex.: segurança web, autenticação]
Objeto: [Recurso alvo, ex.: diretório, arquivo]
Nome do Objeto: [Nome específico do recurso]
Tipo do Objeto: [Tipo de recurso, ex.: diretório web, banco de dados]
Assunto: [Resumo do evento, ex.: tentativa de acesso a diretório restrito]
Política: [Política de segurança violada, se aplicável]
Nome da Ameaça: [Nome da ameaça, ex.: sondagem automatizada]
Nome do Processo: [Processo envolvido, se aplicável]
Nome da Regra MPE: {ruleName}
Mensagem do Fornecedor: [Mensagem ou código de erro do sistema]
ID do Fornecedor: [Identificador único do evento, se disponível]
Identificador de Navegador: [User-agent ou identificador, se aplicável]
Ação: [Ação realizada, ex.: tentativa de acesso]
Status: [Status da ação, ex.: sucesso, falha]
Log: {log}

🕵 Justificativa: [Explique o motivo da suspeita com base no log]
📌 Recomendações:
• [Recomendação prática com base no log]
• [Recomendação adicional para mitigar o evento]
• [Recomendação final]

Log para análise:
${obfuscatedLog}`

  return basePrompt
}
