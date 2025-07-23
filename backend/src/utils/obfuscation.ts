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

  // Regex patterns for detection
  const patterns = {
    ipv4: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    ipv6: /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/g,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    username: /\b(?:user|username|account|login|logon)[\s:=]+([a-zA-Z0-9._-]+)\b/gi,
    domain: /\b[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.([a-zA-Z]{2,})\b/g,
    hash: /\b[a-fA-F0-9]{32}\b|\b[a-fA-F0-9]{40}\b|\b[a-fA-F0-9]{64}\b/g,
    session: /\b(?:session|sess|sid)[\s:=]+([a-zA-Z0-9._-]+)\b/gi,
    hostname: /\b(?:host|hostname|computer)[\s:=]+([a-zA-Z0-9._-]+)\b/gi,
  }

  // Ofuscar apenas IPs e usuários (não e-mails, domínios, hashes, hostname, etc)
  // Detect and obfuscate IPs
  const ipMatches = [...logText.matchAll(patterns.ipv4), ...logText.matchAll(patterns.ipv6)]
  ipMatches.forEach((match) => {
    if (match[0] && !detectedData.ips.includes(match[0])) {
      detectedData.ips.push(match[0])
      obfuscatedText = obfuscatedText.replace(new RegExp(escapeRegex(match[0]), "g"), "[IP_OFUSCADO]")
    }
  })

  // Detect and obfuscate usernames (usuário de origem/afetado)
  const userMatches = [...logText.matchAll(patterns.username)]
  userMatches.forEach((match) => {
    if (match[1] && !detectedData.users.includes(match[1])) {
      detectedData.users.push(match[1])
      obfuscatedText = obfuscatedText.replace(new RegExp(escapeRegex(match[1]), "g"), "[USUARIO_OFUSCADO]")
    }
  })

  // Detect emails, domains, hashes, sessions, hostname, mas NÃO ofusca
  const emailMatches = [...logText.matchAll(patterns.email)]
  emailMatches.forEach((match) => {
    if (match[0] && !detectedData.emails.includes(match[0])) {
      detectedData.emails.push(match[0])
    }
  })
  const domainMatches = [...logText.matchAll(patterns.domain)]
  domainMatches.forEach((match) => {
    if (match[0] && !detectedData.domains.includes(match[0])) {
      detectedData.domains.push(match[0])
    }
  })
  const hashMatches = [...logText.matchAll(patterns.hash)]
  hashMatches.forEach((match) => {
    if (match[0] && !detectedData.hashes.includes(match[0])) {
      detectedData.hashes.push(match[0])
    }
  })
  const sessionMatches = [...logText.matchAll(patterns.session)]
  sessionMatches.forEach((match) => {
    if (match[1] && !detectedData.sessions.includes(match[1])) {
      detectedData.sessions.push(match[1])
    }
  })
  // Hostname detecta mas não ofusca

  return {
    obfuscatedText,
    detectedData,
  }
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function generateAIPrompt(obfuscatedLog: string, _reportType: string): string {
  const basePrompt = `Você é um analista sênior de segurança cibernética. Analise o log abaixo e preenchendo apenas os campos para os quais houver informação disponível. Seja objetivo, evite jargões técnicos desnecessários e forneça recomendações práticas e acionáveis.
Estruture sua resposta nos seguintes tópicos:

Modelo:
Prezados(as), {saudacao}.
Foi identificada atividade suspeita pela equipe de monitoramento no seu ambiente. Detalhes para validação:

🕵 Análise: [Forneça uma análise técnica do evento]

📊 Fonte: [Identifique a fonte do log, ex.: Windows Event Log, Syslog]

🚨 Severidade: [Classifique a severidade, ex.: Baixa, Moderada, Alta]

🧾 Evidências:

[Inclua apenas campos com informações disponíveis]
Data do Log: 
Fonte do Log:
Usuário de Origem: 
Usuário Afetado:
IP/Host de Origem: 
IP/Host Afetado:
Localização (Origem/Impactado):
Tipo do Evento: 
Grupo: 
Objeto:
Nome do Objeto: 
Tipo do Objeto: 
Assunto: 
Política: 
Nome da Ameaça: 
Nome do Processo:
Nome da Regra MPE:
Mensagem do Fornecedor:
ID do Fornecedor: 
Identificador de Navegador:
Ação: 
Status: 
Log: {log}

🕵 Justificativa: [Por que este evento merece atenção? Considere gravidade, contexto, recorrência, possíveis riscos e relação com políticas de segurança.]

📌 Recomendações:

Log para análise:
${obfuscatedLog}`

  return basePrompt
}
