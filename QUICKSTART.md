# 🚀 Guia de Início Rápido - ShadoIA V2

## Pré-requisitos
- Docker e Docker Compose instalados
- Node.js 18+ (para desenvolvimento local)

## 🐳 Execução Rápida com Docker

### 1. Desenvolvimento (Recomendado para desenvolvimento)
```bash
# Clone o repositório
git clone <seu-repositorio>
cd ShadoIA.V2

# Execute o script de desenvolvimento
./start-dev.sh

# Ou manualmente:
docker-compose -f docker-compose.dev.yml up --build
```

### 2. Produção
```bash
# Execute o script de produção
./start-prod.sh

# Ou manualmente:
docker-compose up --build -d
```

## 🌐 Acessos
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 🔧 Configuração de Variáveis de Ambiente

### Backend
```bash
cd backend
cp env.example .env
# Edite o arquivo .env com suas API keys
```

### Frontend
```bash
cd frontend
cp env.example .env.local
# Edite o arquivo .env.local se necessário
```

## 📋 Comandos Úteis

### Docker
```bash
# Ver logs
docker-compose logs -f

# Parar containers
docker-compose down

# Rebuild específico
docker-compose build frontend
docker-compose build backend

# Executar comando em container
docker-compose exec backend npm run dev
docker-compose exec frontend npm run dev
```

### Desenvolvimento Local
```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run dev
```

## 🔑 API Keys Necessárias

Para usar todas as funcionalidades, você precisará das seguintes API keys:

1. **OpenAI API Key** (para análise de logs)
2. **Azure OpenAI** (opcional, alternativa ao OpenAI)
3. **Anthropic API Key** (opcional, para Claude)
4. **VirusTotal API Key** (para verificação de ameaças)
5. **AbuseIPDB API Key** (para verificação de IPs)

## 🚨 Solução de Problemas

### Porta já em uso
```bash
# Verificar portas em uso
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001

# Parar processos
sudo kill -9 <PID>
```

### Containers não iniciam
```bash
# Verificar logs
docker-compose logs

# Rebuild completo
docker-compose down
docker system prune -f
docker-compose up --build
```

### Problemas de permissão (Linux/Mac)
```bash
# Dar permissão aos scripts
chmod +x start-dev.sh start-prod.sh
```

## 📚 Próximos Passos

1. Configure suas API keys no arquivo `.env` do backend
2. Acesse http://localhost:3000
3. Teste a análise de logs e verificação de ameaças
4. Explore a documentação completa no README.md

## 🆘 Suporte

- Verifique os logs: `docker-compose logs -f`
- Consulte o README.md principal
- Abra uma issue no repositório

---

**ShadoIA V2** - Plataforma de Análise de Segurança com IA 