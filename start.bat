@echo off
REM Script para iniciar Activamente en Docker (Windows)

echo.
echo ========================================
echo   Iniciando Activamente en Docker
echo ========================================
echo.

REM Verificar si Docker está instalado
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker no esta instalado.
    echo Por favor instala Docker Desktop primero.
    echo Descarga: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo [OK] Docker esta instalado
echo.

REM Detener contenedores existentes
echo Deteniendo contenedores existentes...
docker-compose down 2>nul
echo.

REM Construir y levantar contenedores
echo Construyendo y levantando contenedores...
docker-compose up -d --build

if errorlevel 1 (
    echo.
    echo [ERROR] Hubo un problema al iniciar los contenedores.
    echo Revisa los logs con: docker-compose logs
    pause
    exit /b 1
)

echo.
echo Esperando a que la base de datos este lista...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo   LISTO! La aplicacion esta corriendo
echo ========================================
echo.
echo   Web:  http://localhost:8082
echo.
echo Base de datos MySQL:
echo   Host: localhost:3306
echo   Database: activamente
echo   User: activamente_user
echo   Password: activamente_pass
echo.
echo Comandos utiles:
echo   Ver logs:    docker-compose logs -f
echo   Detener:     docker-compose down
echo   Reiniciar:   docker-compose restart
echo.
pause
