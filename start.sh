#!/bin/bash
# Script para iniciar Activamente en Docker

echo "🚀 Iniciando Activamente en Docker..."
echo ""

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker Desktop primero."
    echo "   Descarga: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Verificar si Docker Compose está disponible
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose no está disponible."
    exit 1
fi

echo "✅ Docker está instalado"
echo ""

# Detener contenedores existentes si los hay
echo "🛑 Deteniendo contenedores existentes (si los hay)..."
docker-compose down 2>/dev/null

echo ""
echo "🔨 Construyendo y levantando contenedores..."
docker-compose up -d --build

echo ""
echo "⏳ Esperando a que la base de datos esté lista..."
sleep 10

echo ""
echo "✅ ¡Listo! La aplicación está corriendo en:"
echo ""
echo "   🌐 http://localhost:8082"
echo ""
echo "📊 Base de datos MySQL:"
echo "   Host: localhost:3306"
echo "   Database: activamente"
echo "   User: activamente_user"
echo "   Password: activamente_pass"
echo ""
echo "📝 Comandos útiles:"
echo "   Ver logs:        docker-compose logs -f"
echo "   Detener:         docker-compose down"
echo "   Reiniciar:       docker-compose restart"
echo ""
