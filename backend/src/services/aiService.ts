import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateAIAnalysis(prompt: string, provider: string): Promise<{ text: string; usage?: any }> {
  if (provider === "gemini") {
    // Novo prompt seguro e detalhado
    const securePrompt = `Você é um analista sênior de segurança cibernética. Analise o log abaixo, sabendo que dados sensíveis (como IPs, usuários, emails) foram ofuscados e aparecem como [IP_OFUSCADO], [USUARIO_OFUSCADO], [EMAIL_OFUSCADO], etc.\n\nPreencha o relatório abaixo com base nas informações disponíveis, mesmo que estejam ofuscadas. Se algum campo não estiver presente, deixe em branco.\n\nLog para análise:\n${prompt}\n\nPreencha o relatório nos seguintes campos:\n- Data do Log:\n- Fonte do Log:\n- Usuário de Origem:\n- Usuário Afetado:\n- IP/Host de Origem:\n- IP/Host Afetado:\n- Tipo do Evento:\n- Grupo:\n- Objeto:\n- Nome do Objeto:\n- Tipo do Objeto:\n- Assunto:\n- Política:\n- Nome da Ameaça:\n- Nome do Processo:\n- Nome da Regra MPE:\n- Mensagem do Fornecedor:\n- ID do Fornecedor:\n- Identificador de Navegador:\n- Ação:\n- Status:\n- Justificativa:\n- Recomendações:`;
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "")
    const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const result = await geminiModel.generateContent(securePrompt)
    const response = await result.response
    const text = response.text()
    return {
      text,
      usage: {
        promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
        completionTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: result.response.usageMetadata?.totalTokenCount || 0,
      }
    }
  } else {
    throw new Error("Somente o provider 'gemini' está habilitado neste backend.")
  }
}
