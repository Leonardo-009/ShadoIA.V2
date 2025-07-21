#!/bin/bash

echo "🚀 Iniciando ShadoIA V2 em modo produção..."

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker e tente novamente."
    exit 1
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down

# Build e start dos containers
echo "🔨 Construindo e iniciando containers..."
docker-compose up --build -d

echo "✅ ShadoIA V2 iniciado com sucesso!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:3001"
echo ""
echo "Para ver os logs, execute: docker-compose logs -f"
echo "Para parar os containers, execute: docker-compose down" 