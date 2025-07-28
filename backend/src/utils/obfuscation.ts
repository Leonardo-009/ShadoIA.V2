export interface ObfuscationResult {
  obfuscatedText: string
  detectedData: {
    ips: string[]
    emails: string[]
    users: string[]
    domains: string[]
    hashes: string[]
    sessions: string[]
    passwords: string[]
    tokens: string[]
    creditCards: string[]
    phoneNumbers: string[]
  }
  obfuscationStats: {
    totalDetected: number
    obfuscatedCount: number
    preservedCount: number
    contextPreserved: boolean
  }
}

// Configuração inteligente de ofuscação
interface ObfuscationConfig {
  preserveContext: boolean
  smartDetection: boolean
  sensitiveFields: string[]
  whitelistDomains: string[]
  blacklistPatterns: string[]
}

const DEFAULT_CONFIG: ObfuscationConfig = {
  preserveContext: true,
  smartDetection: true,
  sensitiveFields: ['password', 'token', 'secret', 'key', 'credential'],
  whitelistDomains: ['localhost', '127.0.0.1', '0.0.0.0'],
  blacklistPatterns: ['test', 'example', 'dummy', 'fake']
}

export function obfuscateLogData(logText: string, config: Partial<ObfuscationConfig> = {}): ObfuscationResult {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  let obfuscatedText = logText
  const detectedData = {
    ips: [] as string[],
    emails: [] as string[],
    users: [] as string[],
    domains: [] as string[],
    hashes: [] as string[],
    sessions: [] as string[],
    passwords: [] as string[],
    tokens: [] as string[],
    creditCards: [] as string[],
    phoneNumbers: [] as string[],
  }

  let obfuscatedCount = 0
  let preservedCount = 0

  // Regex patterns melhorados para detecção inteligente
  const patterns = {
    // IPs - mais preciso e com contexto
    ipv4: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    ipv6: /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/g,
    
    // Emails - mais robusto
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    
    // Usernames - padrão mais abrangente para capturar diferentes formatos
    username: /\b(?:user|username|account|login|logon|uid|userid)[\s:=]+([a-zA-Z0-9._-]+)\b/gi,
    
    // Usernames em campos específicos - mais preciso e abrangente
    usernameField: /(?:Usuário de Origem|Usuário Afetado|User|Username)[\s:]+([a-zA-Z0-9._-]+)\b/gi,
    
    // Campos específicos de relatório - para capturar dados gerados pela IA
    reportUserOrigin: /Usuário de Origem:\s*([^\n\r]+)/gi,
    reportUserAffected: /Usuário Afetado:\s*([^\n\r]+)/gi,
    reportHostOrigin: /IP\/Host de Origem:\s*([^\n\r]+)/gi,
    reportHostAffected: /IP\/Host Afetado:\s*([^\n\r]+)/gi,
    
    // UserID em XML - específico para logs Sysmon
    userIdXml: /UserID=['"]([^'"]+)['"]/gi,
    
    // User em XML - específico para logs Sysmon (corrigido)
    userXml: /<Data Name='User'>([^<]+)<\/Data>/gi,
    
    // ParentUser em XML - específico para logs Sysmon (corrigido)
    parentUserXml: /<Data Name='ParentUser'>([^<]+)<\/Data>/gi,
    
    // Domínios - mais preciso
    domain: /\b[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.([a-zA-Z]{2,})\b/g,
    
    // Hostnames em campos específicos - mais abrangente
    hostnameField: /(?:IP\/Host de Origem|Hostname|Computer|Server)[\s:]+([a-zA-Z0-9._-]+(?:\.[a-zA-Z0-9._-]+)*)\b/gi,
    
    // Computer em XML - específico para logs Sysmon (corrigido)
    computerXml: /<Computer>([^<]+)<\/Computer>/gi,
    
    // Hashes - suporte a mais tipos
    hash: /\b[a-fA-F0-9]{32}\b|\b[a-fA-F0-9]{40}\b|\b[a-fA-F0-9]{64}\b|\b[a-fA-F0-9]{128}\b/g,
    
    // Sessions - mais abrangente
    session: /\b(?:session|sess|sid|jsessionid|phpsessid)[\s:=]+([a-zA-Z0-9._-]+)\b/gi,
    
    // Passwords - detecção inteligente
    password: /\b(?:password|passwd|pwd|secret)[\s:=]+([^\s\n\r]+)\b/gi,
    
    // Tokens - JWT, API keys, etc
    token: /\b(?:token|jwt|apikey|auth)[\s:=]+([a-zA-Z0-9._-]+)\b/gi,
    
    // Credit cards - mascaramento
    creditCard: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})\b/g,
    
    // Phone numbers
    phoneNumber: /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
    
    // Hostnames - mais específico e abrangente
    hostname: /\b(?:host|hostname|computer|server)[\s:=]+([a-zA-Z0-9._-]+)\b/gi,
  }

  // Função para verificar se deve preservar o contexto
  function shouldPreserveContext(value: string, type: string): boolean {
    if (!finalConfig.preserveContext) return false
    
    // Preservar IPs internos/loopback
    if (type === 'ip' && finalConfig.whitelistDomains.some(domain => value.includes(domain))) {
      return true
    }
    
    // Preservar domínios de teste
    if (type === 'domain' && finalConfig.blacklistPatterns.some(pattern => value.toLowerCase().includes(pattern))) {
      return true
    }
    
    return false
  }

  // Função para gerar placeholder inteligente
  function generateIntelligentPlaceholder(value: string, type: string): string {
    const context = getContextFromValue(value, type)
    
    switch (type) {
      case 'ip':
        return context === 'internal' ? '[IP_INTERNO]' : '[IP_OFUSCADO]'
      case 'user':
        return context === 'system' ? '[USUARIO_SISTEMA]' : '[USUARIO_OFUSCADO]'
      case 'email':
        return '[EMAIL_OFUSCADO]'
      case 'password':
        return '[SENHA_OFUSCADA]'
      case 'token':
        return '[TOKEN_OFUSCADO]'
      case 'hash':
        return '[HASH_OFUSCADO]'
      case 'session':
        return '[SESSAO_OFUSCADA]'
      case 'creditCard':
        return '[CARTAO_OFUSCADO]'
      case 'phoneNumber':
        return '[TELEFONE_OFUSCADO]'
      default:
        return '[DADO_OFUSCADO]'
    }
  }

  // Função para detectar contexto do valor
  function getContextFromValue(value: string, type: string): string {
    if (type === 'ip') {
      if (value.startsWith('10.') || value.startsWith('192.168.') || value.startsWith('172.')) {
        return 'internal'
      }
      if (value === '127.0.0.1' || value === 'localhost') {
        return 'loopback'
      }
    }
    
    if (type === 'user') {
      if (['root', 'admin', 'system', 'service'].includes(value.toLowerCase())) {
        return 'system'
      }
    }
    
    return 'external'
  }

  // Processamento inteligente de IPs
  const ipMatches = [...logText.matchAll(patterns.ipv4), ...logText.matchAll(patterns.ipv6)]
  ipMatches.forEach((match) => {
    if (match[0] && !detectedData.ips.includes(match[0])) {
      detectedData.ips.push(match[0])
      
      if (shouldPreserveContext(match[0], 'ip')) {
        preservedCount++
        // Preserva IPs internos para contexto
      } else {
        obfuscatedCount++
        obfuscatedText = obfuscatedText.replace(
          new RegExp(escapeRegex(match[0]), "g"), 
          generateIntelligentPlaceholder(match[0], 'ip')
        )
      }
    }
  })

  // Processamento inteligente de usuários
  const userMatches = [...logText.matchAll(patterns.username)]
  userMatches.forEach((match) => {
    if (match[1] && !detectedData.users.includes(match[1])) {
      detectedData.users.push(match[1])
      
      if (shouldPreserveContext(match[1], 'user')) {
        preservedCount++
      } else {
        obfuscatedCount++
        obfuscatedText = obfuscatedText.replace(
          new RegExp(escapeRegex(match[1]), "g"), 
          generateIntelligentPlaceholder(match[1], 'user')
        )
      }
    }
  })

  // Processamento de usernames simples (sem prefixo)
  const simpleUserMatches = [...logText.matchAll(patterns.usernameField)]
  simpleUserMatches.forEach((match) => {
    if (match[1] && !detectedData.users.includes(match[1])) {
      // Verificar se não é um domínio ou IP
      const isDomain = /\./.test(match[1])
      const isIP = /^\d+\.\d+\.\d+\.\d+$/.test(match[1])
      
      if (!isDomain && !isIP && match[1].length > 2) {
        detectedData.users.push(match[1])
        
        if (shouldPreserveContext(match[1], 'user')) {
          preservedCount++
        } else {
          obfuscatedCount++
          obfuscatedText = obfuscatedText.replace(
            new RegExp(escapeRegex(match[1]), "g"), 
            generateIntelligentPlaceholder(match[1], 'user')
          )
        }
      }
    }
  })

  // Processamento de campos específicos de relatório
  const reportUserOriginMatches = [...logText.matchAll(patterns.reportUserOrigin)]
  reportUserOriginMatches.forEach((match) => {
    if (match[1] && !detectedData.users.includes(match[1])) {
      detectedData.users.push(match[1])
      obfuscatedCount++
      obfuscatedText = obfuscatedText.replace(
        new RegExp(escapeRegex(match[0]), "g"), 
        `Usuário de Origem: [USUARIO_OFUSCADO]`
      )
    }
  })

  const reportUserAffectedMatches = [...logText.matchAll(patterns.reportUserAffected)]
  reportUserAffectedMatches.forEach((match) => {
    if (match[1] && !detectedData.users.includes(match[1])) {
      detectedData.users.push(match[1])
      obfuscatedCount++
      obfuscatedText = obfuscatedText.replace(
        new RegExp(escapeRegex(match[0]), "g"), 
        `Usuário Afetado: [USUARIO_OFUSCADO]`
      )
    }
  })

  const reportHostOriginMatches = [...logText.matchAll(patterns.reportHostOrigin)]
  reportHostOriginMatches.forEach((match) => {
    if (match[1] && !detectedData.ips.includes(match[1])) {
      detectedData.ips.push(match[1])
      obfuscatedCount++
      obfuscatedText = obfuscatedText.replace(
        new RegExp(escapeRegex(match[0]), "g"), 
        `IP/Host de Origem: [IP_OFUSCADO]`
      )
    }
  })

  const reportHostAffectedMatches = [...logText.matchAll(patterns.reportHostAffected)]
  reportHostAffectedMatches.forEach((match) => {
    if (match[1] && !detectedData.ips.includes(match[1])) {
      detectedData.ips.push(match[1])
      obfuscatedCount++
      obfuscatedText = obfuscatedText.replace(
        new RegExp(escapeRegex(match[0]), "g"), 
        `IP/Host Afetado: [IP_OFUSCADO]`
      )
    }
  })

  // Processamento de hostnames simples
  const simpleHostnameMatches = [...logText.matchAll(patterns.hostnameField)]
  simpleHostnameMatches.forEach((match) => {
    if (match[1] && !detectedData.domains.includes(match[1])) {
      detectedData.domains.push(match[1])
      preservedCount++
    }
  })

  // Processamento de UserID em XML (Sysmon)
  const userIdXmlMatches = [...logText.matchAll(patterns.userIdXml)]
  userIdXmlMatches.forEach((match) => {
    if (match[1] && !detectedData.users.includes(match[1])) {
      detectedData.users.push(match[1])
      obfuscatedCount++
      obfuscatedText = obfuscatedText.replace(
        new RegExp(escapeRegex(match[0]), "g"), 
        `UserID='[USUARIO_OFUSCADO]'`
      )
    }
  })

  // Processamento de User em XML (Sysmon)
  const userXmlMatches = [...logText.matchAll(patterns.userXml)]
  userXmlMatches.forEach((match) => {
    if (match[1] && !detectedData.users.includes(match[1])) {
      detectedData.users.push(match[1])
      obfuscatedCount++
      obfuscatedText = obfuscatedText.replace(
        new RegExp(escapeRegex(match[0]), "g"), 
        `<Data Name='User'>[USUARIO_OFUSCADO]</Data>`
      )
    }
  })

  // Processamento de ParentUser em XML (Sysmon)
  const parentUserXmlMatches = [...logText.matchAll(patterns.parentUserXml)]
  parentUserXmlMatches.forEach((match) => {
    if (match[1] && !detectedData.users.includes(match[1])) {
      detectedData.users.push(match[1])
      obfuscatedCount++
      obfuscatedText = obfuscatedText.replace(
        new RegExp(escapeRegex(match[0]), "g"), 
        `<Data Name='ParentUser'>[USUARIO_OFUSCADO]</Data>`
      )
    }
  })

  // Processamento de Computer em XML (Sysmon)
  const computerXmlMatches = [...logText.matchAll(patterns.computerXml)]
  computerXmlMatches.forEach((match) => {
    if (match[1] && !detectedData.domains.includes(match[1])) {
      detectedData.domains.push(match[1])
      obfuscatedCount++
      obfuscatedText = obfuscatedText.replace(
        new RegExp(escapeRegex(match[0]), "g"), 
        `<Computer>[HOSTNAME_OFUSCADO]</Computer>`
      )
    }
  })

  // Detecção de senhas (sempre ofuscar)
  const passwordMatches = [...logText.matchAll(patterns.password)]
  passwordMatches.forEach((match) => {
    if (match[1] && !detectedData.passwords.includes(match[1])) {
      detectedData.passwords.push(match[1])
      obfuscatedCount++
      obfuscatedText = obfuscatedText.replace(
        new RegExp(escapeRegex(match[1]), "g"), 
        generateIntelligentPlaceholder(match[1], 'password')
      )
    }
  })

  // Detecção de tokens (sempre ofuscar)
  const tokenMatches = [...logText.matchAll(patterns.token)]
  tokenMatches.forEach((match) => {
    if (match[1] && !detectedData.tokens.includes(match[1])) {
      detectedData.tokens.push(match[1])
      obfuscatedCount++
      obfuscatedText = obfuscatedText.replace(
        new RegExp(escapeRegex(match[1]), "g"), 
        generateIntelligentPlaceholder(match[1], 'token')
      )
    }
  })

  // Detecção de cartões de crédito (sempre ofuscar)
  const creditCardMatches = [...logText.matchAll(patterns.creditCard)]
  creditCardMatches.forEach((match) => {
    if (match[0] && !detectedData.creditCards.includes(match[0])) {
      detectedData.creditCards.push(match[0])
      obfuscatedCount++
      obfuscatedText = obfuscatedText.replace(
        new RegExp(escapeRegex(match[0]), "g"), 
        generateIntelligentPlaceholder(match[0], 'creditCard')
      )
    }
  })

  // Detecção de telefones (sempre ofuscar)
  const phoneMatches = [...logText.matchAll(patterns.phoneNumber)]
  phoneMatches.forEach((match) => {
    if (match[0] && !detectedData.phoneNumbers.includes(match[0])) {
      detectedData.phoneNumbers.push(match[0])
      obfuscatedCount++
      obfuscatedText = obfuscatedText.replace(
        new RegExp(escapeRegex(match[0]), "g"), 
        generateIntelligentPlaceholder(match[0], 'phoneNumber')
      )
    }
  })

  // Detecção de emails (detectar mas não ofuscar por padrão)
  const emailMatches = [...logText.matchAll(patterns.email)]
  emailMatches.forEach((match) => {
    if (match[0] && !detectedData.emails.includes(match[0])) {
      detectedData.emails.push(match[0])
      preservedCount++
    }
  })

  // Detecção de domínios (detectar mas não ofuscar por padrão)
  const domainMatches = [...logText.matchAll(patterns.domain)]
  domainMatches.forEach((match) => {
    if (match[0] && !detectedData.domains.includes(match[0])) {
      detectedData.domains.push(match[0])
      preservedCount++
    }
  })

  // Detecção de hashes (detectar mas não ofuscar por padrão)
  const hashMatches = [...logText.matchAll(patterns.hash)]
  hashMatches.forEach((match) => {
    if (match[0] && !detectedData.hashes.includes(match[0])) {
      detectedData.hashes.push(match[0])
      preservedCount++
    }
  })

  // Detecção de sessions (detectar mas não ofuscar por padrão)
  const sessionMatches = [...logText.matchAll(patterns.session)]
  sessionMatches.forEach((match) => {
    if (match[1] && !detectedData.sessions.includes(match[1])) {
      detectedData.sessions.push(match[1])
      preservedCount++
    }
  })

  const totalDetected = obfuscatedCount + preservedCount

  return {
    obfuscatedText,
    detectedData,
    obfuscationStats: {
      totalDetected,
      obfuscatedCount,
      preservedCount,
      contextPreserved: finalConfig.preserveContext
    }
  }
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// Função para demonstrar as melhorias da ofuscação inteligente
export function demonstrateIntelligentObfuscation(logText: string): {
  original: string
  improved: ObfuscationResult
  comparison: {
    totalDetected: number
    obfuscatedCount: number
    preservedCount: number
    contextPreserved: boolean
    newDataTypes: string[]
  }
} {
  const improved = obfuscateLogData(logText, {
    preserveContext: true,
    smartDetection: true
  })

  const newDataTypes = []
  if (improved.detectedData.passwords.length > 0) newDataTypes.push('passwords')
  if (improved.detectedData.tokens.length > 0) newDataTypes.push('tokens')
  if (improved.detectedData.creditCards.length > 0) newDataTypes.push('creditCards')
  if (improved.detectedData.phoneNumbers.length > 0) newDataTypes.push('phoneNumbers')

  return {
    original: logText,
    improved,
    comparison: {
      totalDetected: improved.obfuscationStats.totalDetected,
      obfuscatedCount: improved.obfuscationStats.obfuscatedCount,
      preservedCount: improved.obfuscationStats.preservedCount,
      contextPreserved: improved.obfuscationStats.contextPreserved,
      newDataTypes
    }
  }
}

export function generateAIPrompt(obfuscatedLog: string, _reportType: string): string {
  const basePrompt = `Você é um analista sênior de segurança cibernética. Analise o log abaixo e forneça um relatório estruturado e organizado. Seja objetivo, evite jargões técnicos desnecessários e forneça recomendações práticas e acionáveis.

IMPORTANTE: Estruture sua resposta EXATAMENTE no formato especificado abaixo, preenchendo apenas os campos para os quais houver informação disponível no log.

NOTA SOBRE DADOS OFUSCADOS: Os dados sensíveis foram protegidos automaticamente e aparecem como placeholders inteligentes:
- [IP_OFUSCADO] ou [IP_INTERNO] - Endereços IP
- [USUARIO_OFUSCADO] ou [USUARIO_SISTEMA] - Nomes de usuário
- [EMAIL_OFUSCADO] - Endereços de email
- [SENHA_OFUSCADA] - Senhas detectadas
- [TOKEN_OFUSCADO] - Tokens de autenticação
- [HASH_OFUSCADO] - Hashes de arquivos
- [SESSAO_OFUSCADA] - IDs de sessão
- [CARTAO_OFUSCADO] - Números de cartão de crédito
- [TELEFONE_OFUSCADO] - Números de telefone

FORMATO OBRIGATÓRIO:

Prezados(as), {saudacao}.

Foi identificada atividade suspeita pela equipe de monitoramento no seu ambiente. Detalhes para validação:

🕵 Análise: [Forneça uma análise técnica clara e concisa do evento de segurança]

📊 Fonte: [Identifique a fonte do log, ex.: Windows Event Log, Syslog, Check Point SmartDefense]

🚨 Severidade: [Classifique a severidade: Baixa, Moderada, Alta, Crítica]

🧾 Evidências:

Data do Log: [Data e hora do evento]
Fonte do Log: [Sistema ou componente que gerou o log]
Usuário de Origem: [Usuário associado, se aplicável]
Usuário Afetado: [Usuário impactado, se aplicável]
IP/Host de Origem: [IP ou host que gerou o evento]
IP/Host Afetado: [IP ou host impactado]
Localização (Origem/Impactado): [Localização geográfica ou lógica, se disponível]
Tipo do Evento: [Tipo de evento, ex.: tentativa de exploração, falha de autenticação]
Grupo: [Categoria do evento, ex.: SmartDefense, Firewall]
Objeto: [Recurso alvo, ex.: SNMP, HTTP]
Nome do Objeto: [Nome específico do recurso, ex.: bsnmpd]
Tipo do Objeto: [Tipo de recurso, ex.: Serviço, Aplicação]
Assunto: [Resumo do evento, ex.: SNMP Protection Violation]
Política: [Política ou configuração relevante, se aplicável]
Nome da Ameaça: [Nome da ameaça detectada, ex.: FreeBSD bsnmpd GETBULK PDU Stack Buffer Overflow]
Nome do Processo: [Processo envolvido, ex.: bsnmpd]
Nome da Regra MPE: [Regra que disparou o alerta, se aplicável]
Mensagem do Fornecedor: [Mensagem ou código de erro do sistema]
ID do Fornecedor: [Identificador único do evento, se disponível]
Identificador de Navegador: [User-agent, se aplicável]
Ação: [Ação tomada, ex.: Detect, Block, Alert]
Status: [Status da ação, ex.: Bloqueado, Falha, Sucesso]
Resultado: [Resultado final, se aplicável]

🕵 Justificativa: [Explique por que este evento merece atenção, considerando gravidade, contexto, recorrência, possíveis riscos e relação com políticas de segurança]

📌 Recomendações:

• [Recomendação 1 - específica e acionável]
• [Recomendação 2 - específica e acionável]
• [Recomendação 3 - específica e acionável]
• [Recomendação 4 - específica e acionável]
• [Recomendação 5 - específica e acionável]

Log para análise:
${obfuscatedLog}

Lembre-se: Mantenha o formato exato especificado acima e preencha apenas os campos para os quais há informações disponíveis no log.`

  return basePrompt
}

// Exemplo de uso da ofuscação inteligente
export function exampleIntelligentObfuscation(): void {
  const sampleLog = `
2024-01-15 14:30:22 [SECURITY] User admin@company.com from 192.168.1.100 attempted login
Password: mySecretPassword123
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Session ID: abc123def456
Credit Card: 4111-1111-1111-1111
Phone: +1-555-123-4567
Internal IP: 10.0.0.1 (preserved for context)
Test domain: example.com (preserved for testing)
Hash: d41d8cd98f00b204e9800998ecf8427e
  `

  console.log("=== EXEMPLO DE OFUSCAÇÃO INTELIGENTE ===")
  console.log("Log Original:")
  console.log(sampleLog)
  
  const result = obfuscateLogData(sampleLog, {
    preserveContext: true,
    smartDetection: true
  })
  
  console.log("\nLog Ofuscado:")
  console.log(result.obfuscatedText)
  
  console.log("\nEstatísticas de Proteção:")
  console.log(`- Total detectado: ${result.obfuscationStats.totalDetected}`)
  console.log(`- Ofuscados: ${result.obfuscationStats.obfuscatedCount}`)
  console.log(`- Preservados: ${result.obfuscationStats.preservedCount}`)
  console.log(`- Contexto preservado: ${result.obfuscationStats.contextPreserved}`)
  
  console.log("\nDados Detectados:")
  Object.entries(result.detectedData).forEach(([type, values]) => {
    if (values.length > 0) {
      console.log(`- ${type}: ${values.length} item(s)`)
    }
  })
}
