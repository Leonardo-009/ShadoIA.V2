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
export function generateAIPrompt(obfuscatedLog: string, _reportType: string): string {
  return `
Você é um analista sênior de segurança cibernética. Analise o log abaixo e produza um relatório profissional, preenchendo apenas os campos para os quais houver informação disponível. Seja objetivo, evite jargões técnicos desnecessários e forneça recomendações práticas e acionáveis.

Estruture sua resposta nos seguintes tópicos (remova qualquer campo sem informação):

1. Resumo Executivo: Descreva brevemente o evento, seu contexto e relevância para a segurança.
2. Indicadores Detectados: Liste todos os IPs, usuários, domínios, hashes, processos, comandos, arquivos, sessões e outros identificadores relevantes encontrados no log.

Prezados(as), {saudacao}.
Atividade suspeita detectada, no ambiente. Detalhes para validação:

Caso de uso: [Descreva o evento com base no log]

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

🕵 Justificativa: [Por que este evento merece atenção? Considere gravidade, contexto, recorrência, possíveis riscos e relação com políticas de segurança.]

📌 Recomendações:


Log para análise:
${obfuscatedLog}
`
}
