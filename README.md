# 🛡️ ShadoIA V2 - Plataforma de Análise de Segurança com IA

[![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=flat&logo=docker)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.2-blue?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

> **Plataforma completa para análise de logs de segurança e verificação de ameaças com Inteligência Artificial e proteção avançada de dados sensíveis.**

## 📋 Índice

- [🎯 Visão Geral](#-visão-geral)
- [🚀 Funcionalidades](#-funcionalidades)
- [🏗️ Arquitetura](#️-arquitetura)
- [🛡️ Recursos de Segurança](#️-recursos-de-segurança)
- [📦 Tecnologias](#-tecnologias)
- [⚡ Instalação Rápida](#-instalação-rápida)
- [🔧 Configuração](#-configuração)
- [🌐 Deploy](#-deploy)
- [📚 Documentação](#-documentação)
- [🤝 Contribuição](#-contribuição)
- [📄 Licença](#-licença)

## 🎯 Visão Geral

O **ShadoIA V2** é uma plataforma moderna e robusta para análise de segurança cibernética que combina:

- **Análise Inteligente de Logs** com IA (Google Gemini)
- **Verificação de Ameaças** em tempo real (VirusTotal, AbuseIPDB)
- **Proteção Avançada de Dados** com ofuscação inteligente
- **Interface Moderna** com design responsivo
- **Arquitetura Escalável** com microserviços

### 🎯 Casos de Uso

- **SOC Teams**: Análise rápida de logs de segurança
- **CERT/CSIRT**: Investigação de incidentes
- **Auditores**: Verificação de conformidade
- **Analistas**: Triagem de eventos de segurança
- **Pesquisadores**: Análise de ameaças e IOCs

## 🚀 Funcionalidades

### 🔍 Análise de Logs com IA
- **Análise Completa**: Relatórios detalhados com evidências estruturadas
- **Análise de Saúde**: Avaliação do estado de segurança do sistema
- **Refinamento**: Identificação de falsos positivos e ameaças reais
- **Múltiplos Formatos**: Suporte a logs XML, JSON, texto e Sysmon

### 🛡️ Verificação de Ameaças
- **IPs Maliciosos**: Verificação em VirusTotal e AbuseIPDB
- **URLs Suspeitas**: Análise de links e domínios
- **Hashes de Arquivos**: Verificação de malware conhecido
- **Relatórios Consolidados**: Resultados de múltiplas fontes

### 🔐 Proteção Inteligente de Dados
- **Ofuscação Automática**: Detecção e proteção de dados sensíveis
- **Múltiplos Tipos**: IPs, emails, usuários, senhas, tokens, cartões
- **Contexto Preservado**: Mantém estrutura para análise
- **Logs XML**: Suporte completo para logs Sysmon e Windows Events
- **Estatísticas Detalhadas**: Relatório completo de dados protegidos

### 📊 Interface Moderna
- **Dashboard Responsivo**: Design adaptável para todos os dispositivos
- **Tema Escuro/Claro**: Interface personalizável
- **Componentes Modernos**: UI/UX com Shadcn/ui
- **Navegação Intuitiva**: Experiência de usuário otimizada

## 🏗️ Arquitetura

```
ShadoIA.V2/
├── 🎨 frontend/                 # Next.js 15 + React 19 + TypeScript
│   ├── app/                    # App Router (Next.js 15)
│   ├── components/             # Componentes UI (Shadcn/ui)
│   ├── hooks/                  # Custom React Hooks
│   └── utils/                  # Utilitários
├── ⚙️ backend/                  # Express.js + Node.js + TypeScript
│   ├── src/
│   │   ├── controllers/        # Lógica de negócio
│   │   ├── services/           # Serviços externos (IA, TI)
│   │   ├── routes/             # Definição de rotas
│   │   ├── middleware/         # Middlewares (segurança, logs)
│   │   ├── utils/              # Utilitários (ofuscação)
│   │   └── server.ts           # Servidor principal
│   └── package.json
├── 🐳 docker-compose.yml       # Orquestração Docker
├── 📁 config/                  # Configurações de deploy
└── 📄 README.md
```

### 🔄 Fluxo de Dados

```
1. Log Original → 2. Ofuscação → 3. Análise IA → 4. Resultado Final
   ↓                    ↓              ↓              ↓
   Dados Sensíveis    Protegido     Processado     Relatório
   (IPs, Users)      [OFUSCADO]     pela IA       Seguro
```

## 🛡️ Recursos de Segurança

### 🔐 Ofuscação Inteligente
- **Detecção Automática**: Regex avançados para dados sensíveis
- **Múltiplos Formatos**: XML, JSON, texto, relatórios
- **Contexto Preservado**: Mantém estrutura para análise
- **Estatísticas**: Relatório completo de proteção

### 🛡️ Segurança da Aplicação
- **Rate Limiting**: Proteção contra ataques de força bruta
- **CORS**: Controle de origens permitidas
- **Helmet**: Headers de segurança HTTP
- **Validação**: Express-validator para inputs
- **Logging**: Auditoria completa de requisições

### 🔒 Proteção de Dados
- **Dados Sensíveis**: Nunca enviados para APIs externas
- **Ofuscação Pré-IA**: Proteção antes do processamento
- **Logs Seguros**: Auditoria sem exposição de dados
- **Cache Seguro**: Armazenamento temporário protegido

## 📦 Tecnologias

### Frontend
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Next.js** | 15.2.4 | Framework React com SSR |
| **React**   | 19 | Biblioteca de UI |
| **TypeScript** | 5 | Tipagem estática |
| **Tailwind CSS** | 3.4.17 | Framework CSS |
| **Shadcn/ui** | - | Componentes UI |
| **Radix UI** | - | Primitivos acessíveis |

### Backend
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Node.js** | 18+ | Runtime JavaScript |
| **Express.js** | 4.21.2 | Framework web |
| **TypeScript** | 5 | Tipagem estática |
| **Google Gemini** | 0.21.0 | IA para análise |
| **VirusTotal API** | - | Threat Intelligence |
| **AbuseIPDB API** | - | Threat Intelligence |

### DevOps & Infraestrutura
| Tecnologia | Propósito |
|------------|-----------|
| **Docker** | Containerização |
| **Docker Compose** | Orquestração |
| **Nginx** | Proxy reverso |
| **PM2** | Process manager |

## ⚡ Instalação Rápida

### Pré-requisitos
- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Node.js** 18+ (para desenvolvimento)

### 🚀 Deploy com Docker (Recomendado)

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/shadoia-v2.git
cd shadoia-v2

# 2. Configure as variáveis de ambiente
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env

# 3. Edite as variáveis de ambiente
# Adicione suas chaves de API nos arquivos .env

# 4. Execute com Docker Compose
docker-compose up --build -d

# 5. Acesse a aplicação
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

### 🔧 Desenvolvimento Local

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (em outro terminal)
cd frontend
npm install
npm run dev
```

## 🔧 Configuração

### Variáveis de Ambiente

#### Backend (`backend/.env`)
```env
# Servidor
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://localhost:3000

# IA - Google Gemini
GOOGLE_GEMINI_API_KEY=your-gemini-api-key

# Threat Intelligence
VIRUSTOTAL_API_KEY=your-virustotal-api-key
ABUSEIPDB_API_KEY=your-abuseipdb-api-key

# Cache
CACHE_TTL=3600
CACHE_CHECK_PERIOD=600
```

#### Frontend (`frontend/.env`)
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=ShadoIA
NEXT_PUBLIC_APP_VERSION=2.0.0
```

### 🔑 Obtenção de Chaves de API

#### Google Gemini
1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma nova API key
3. Adicione ao arquivo `backend/.env`

#### VirusTotal
1. Registre-se em [VirusTotal](https://www.virustotal.com/gui/join-us)
2. Obtenha sua API key
3. Adicione ao arquivo `backend/.env`

#### AbuseIPDB
1. Registre-se em [AbuseIPDB](https://www.abuseipdb.com/api)
2. Obtenha sua API key
3. Adicione ao arquivo `backend/.env`

## 🌐 Deploy

### 🐳 Docker Compose (Produção)
```bash
# Deploy completo
docker-compose -f docker-compose.yml up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

### ☁️ Deploy em Nuvem

#### Vercel (Frontend)
```bash
cd frontend
vercel --prod
```

#### Railway (Backend)
```bash
cd backend
railway login
railway init
railway up
```

#### VPS/Droplet
```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Clonar e executar
git clone https://github.com/seu-usuario/shadoia-v2.git
cd shadoia-v2
docker-compose up -d
```

### 🔒 Configuração de Segurança

#### Nginx (Proxy Reverso)
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### SSL/HTTPS
```bash
# Certbot para Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

## 📚 Documentação

### 📡 API Endpoints

#### Análise de Logs
```http
POST /api/analyze
Content-Type: application/json

{
  "logText": "seu log aqui",
  "provider": "gemini",
  "reportType": "completo"
}
```

#### Verificação de Ameaças
```http
POST /api/threats/verify
Content-Type: application/json

{
  "indicator": "8.8.8.8",
  "type": "ip"
}
```

#### Health Check
```http
GET /api/health
```

#### Cache Management
```http
GET /api/cache
DELETE /api/cache
```

### 🔧 Scripts Úteis

#### Desenvolvimento
```bash
# Backend
npm run dev          # Desenvolvimento
npm run build        # Build
npm run lint         # Linting

# Frontend
npm run dev          # Desenvolvimento
npm run build        # Build
npm run start        # Produção
```

#### Docker
```bash
# Rebuild específico
docker-compose build backend
docker-compose build frontend

# Logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Shell
docker-compose exec backend sh
docker-compose exec frontend sh
```

### 🛠️ Troubleshooting

#### Problemas Comuns

**Erro: "API key not configured"**
```bash
# Verificar variáveis de ambiente
docker-compose exec backend env | grep API
```

**Erro: "Connection refused"**
```bash
# Verificar se os containers estão rodando
docker-compose ps
docker-compose logs
```

**Erro: "Rate limit exceeded"**
```bash
# Verificar configuração de rate limiting
# Aguardar 15 minutos ou ajustar limites
```

## 🤝 Contribuição

### 📋 Como Contribuir

1. **Fork** o projeto
2. **Clone** seu fork
3. **Crie** uma branch para sua feature
4. **Desenvolva** sua funcionalidade
5. **Teste** suas mudanças
6. **Commit** suas alterações
7. **Push** para sua branch
8. **Abra** um Pull Request

### 🧪 Testes

```bash
# Backend
npm run test
npm run lint

# Frontend
npm run test
npm run lint
```

### 📝 Padrões de Código

- **TypeScript**: Tipagem estática obrigatória
- **ESLint**: Configuração padrão
- **Prettier**: Formatação automática
- **Conventional Commits**: Padrão de commits

### 🐛 Reportando Bugs

1. Verifique se o bug já foi reportado
2. Crie uma issue com:
   - Descrição detalhada
   - Passos para reproduzir
   - Logs de erro
   - Ambiente (OS, versões)

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

```
MIT License

Copyright (c) 2025 ShadoIA V2

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 🙏 Agradecimentos

- **Google Gemini** - IA para análise de logs
- **VirusTotal** - Threat Intelligence
- **AbuseIPDB** - Verificação de IPs maliciosos
- **Shadcn/ui** - Componentes UI modernos
- **Next.js** - Framework React
- **Docker** - Containerização

---

**ShadoIA V2** - Desenvolvido para equipes SOC e análise de segurança

**⭐ Se este projeto foi útil, considere dar uma estrela!**
