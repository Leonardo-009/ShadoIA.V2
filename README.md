# ShadoIA V2 - Plataforma de Análise de Segurança com IA

Plataforma completa para análise de logs de segurança e verificação de ameaças com Inteligência Artificial.

## 🏗️ Arquitetura

O projeto está organizado em duas partes principais:

```
ShadoIA.V2/
├── frontend/          # Next.js 15 + React 19 + TypeScript
├── backend/           # Express.js + Node.js + TypeScript
├── docker-compose.yml # Orquestração Docker (produção)
└── docker-compose.dev.yml # Orquestração Docker (desenvolvimento)
```

## 🚀 Funcionalidades

### Frontend (Next.js)
- **Dashboard Principal**: Interface moderna com gradientes e componentes responsivos
- **Análise de Logs**: Interface para análise de logs com IA
- **Verificação de Ameaças**: Verificação de IPs, URLs e hashes
- **Proteção de Dados**: Ofuscação automática de dados sensíveis
- **UI/UX Moderna**: Shadcn/ui + Tailwind CSS

### Backend (Express.js)
- **Análise com IA**: Múltiplos provedores (OpenAI, Azure, Anthropic)
- **Threat Intelligence**: VirusTotal e AbuseIPDB
- **Cache Inteligente**: Otimização de consultas
- **Segurança**: Rate limiting, CORS, Helmet
- **Logging**: Auditoria estruturada

## 🐳 Execução com Docker

### Passo a Passo Rápido

1. **Configure as variáveis de ambiente:**
   - Copie os arquivos de exemplo:
```bash
     cp backend/env.example backend/.env
     cp frontend/env.example frontend/.env
     ```
   - Edite os arquivos `.env` conforme necessário (adicione suas chaves de API).

2. **Suba os containers:**
```bash
docker-compose up --build
```

3. **Acesse a aplicação:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend: [http://localhost:3001](http://localhost:3001)

### Comandos Úteis
```bash
# Parar todos os containers
docker-compose down

# Ver logs
docker-compose logs -f

# Rebuild específico
docker-compose build frontend
docker-compose build backend
```

## 🌐 Como Deixar o Projeto Online (Acessível pela Internet)

Para expor seu projeto para a internet, você pode:

### 1. Expor as portas do seu servidor
- Certifique-se de que as portas 3000 (frontend) e 3001 (backend) estejam liberadas no firewall da sua máquina/servidor.
- Se estiver em uma VPS (DigitalOcean, AWS, Azure, etc.), libere as portas no painel da nuvem.
- Acesse pelo IP público da máquina: `http://SEU_IP_PUBLICO:3000`

### 2. Usar um Proxy Reverso (Recomendado para Produção)
- Configure um proxy reverso (Nginx, Caddy, Traefik) para redirecionar o tráfego HTTP/HTTPS para os containers.
- Exemplo de configuração Nginx:
  ```nginx
  server {
    listen 80;
    server_name seu-dominio.com;
    location / {
      proxy_pass http://localhost:3000;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
    }
  }
  ```
- Para HTTPS, utilize o [Let's Encrypt](https://letsencrypt.org/) para gerar certificados gratuitos.

### 3. Deploy em Nuvem
- **Frontend:** Pode ser hospedado facilmente no Vercel, Netlify, ou qualquer VPS.
- **Backend:** Pode ser hospedado em Railway, Heroku, Render, ou qualquer VPS.
- **Docker Compose:** Suba ambos em uma VPS (Ubuntu, Debian, etc.) com Docker instalado.

### 4. Dicas de Segurança
- Nunca exponha chaves de API em repositórios públicos.
- Use variáveis de ambiente seguras.
- Considere usar HTTPS sempre que possível.
- Configure CORS corretamente no backend.

## 🔑 Configuração de Variáveis de Ambiente

### Backend (`backend/.env`)
```env
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
OPENAI_API_KEY=sk-your-openai-api-key-here
AZURE_OPENAI_API_KEY=your-azure-openai-api-key-here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here
VIRUSTOTAL_API_KEY=your-virustotal-api-key-here
ABUSEIPDB_API_KEY=your-abuseipdb-api-key-here
CACHE_TTL=3600
CACHE_CHECK_PERIOD=600
```

### Frontend (`frontend/.env`)
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=ShadoIA
NEXT_PUBLIC_APP_VERSION=2.0.0
```

## 🛠️ Desenvolvimento Local

### Pré-requisitos
- Node.js 18+
- npm ou pnpm
- Docker e Docker Compose

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

## 📡 Endpoints da API

### POST /api/analyze
Análise de logs com IA

### POST /api/threats/verify
Verificação de ameaças

### GET /api/health
Status do sistema

### GET/DELETE /api/cache
Gerenciamento de cache

## 🏗️ Estrutura de Pastas

### Frontend
```
frontend/
├── app/              # Next.js App Router
├── components/       # Componentes UI
├── hooks/           # Custom hooks
├── lib/             # Utilitários
├── public/          # Arquivos estáticos
├── styles/          # Estilos globais
└── utils/           # Funções utilitárias
```

### Backend
```
backend/
├── src/
│   ├── controllers/ # Lógica de negócio
│   ├── routes/      # Definição de rotas
│   ├── services/    # Serviços externos
│   ├── middleware/  # Middlewares
│   ├── utils/       # Utilitários
│   └── server.ts    # Servidor principal
```

## 🚀 Deploy

### Docker Compose (Recomendado)
```bash
# Produção
docker-compose up -d

# Desenvolvimento
docker-compose -f docker-compose.dev.yml up -d
```

### Vercel (Frontend)
```bash
cd frontend
vercel
```

### Railway/Heroku (Backend)
```bash
cd backend
# Configurar variáveis de ambiente
# Deploy via Git
```

## 📊 Monitoramento

- Health check: `GET /api/health`
- Cache stats: `GET /api/cache`
- Logs estruturados
- Métricas de performance

## 🔒 Segurança

- **Ofuscação Automática**: Proteção de dados sensíveis
- **Rate Limiting**: 100 requests/15min por IP
- **CORS**: Controle de origens
- **Helmet**: Headers de segurança
- **Validação**: Express-validator
- **Logging**: Auditoria de requisições

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**ShadoIA V2** - Desenvolvido para equipes SOC e análise de segurança

---

## 📁 Pasta config

A pasta `config/` contém exemplos e templates de configuração para deploy em produção, incluindo:
- Configuração de proxy reverso Nginx para expor o frontend e backend de forma segura
- Templates para variáveis de ambiente
- Instruções para uso

Consulte os arquivos dentro de `config/` para adaptar ao seu ambiente de deploy.
