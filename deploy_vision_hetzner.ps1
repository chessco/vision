# Vision - Production Deploy Script (Hetzner)
# Uso: .\deploy_vision_hetzner.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
$SERVER_IP = "46.224.155.43"
$SSH_KEY = "$env:USERPROFILE\.ssh\id_citaia"

Write-Host "--- Iniciando Despliegue de Vision (Hetzner) ---" -ForegroundColor Cyan

try {
    Write-Host "Step 1: Empaquetando y subiendo código..." -ForegroundColor Yellow

    tar --exclude="node_modules" --exclude="dist" --exclude=".vite" -czf deploy_vision.tar.gz api web docker-compose.yml

    scp -i $SSH_KEY -o StrictHostKeyChecking=no deploy_vision.tar.gz root@${SERVER_IP}:/opt/pitaya/vision/

    Write-Host "Step 2: Descomprimiendo y reconstruyendo en el servidor..." -ForegroundColor Yellow

    $remoteCommands = @"
        mkdir -p /opt/pitaya/vision
        cd /opt/pitaya/vision

        echo 'Limpiando conflictos de contenedores antiguos...'
        docker compose down --remove-orphans 2>/dev/null || true
        docker stop pitayavisual-api 2>/dev/null || true
        docker rm pitayavisual-api 2>/dev/null || true
        docker stop pitayavisual-web 2>/dev/null || true
        docker rm pitayavisual-web 2>/dev/null || true

        echo 'Descomprimiendo archivos...'
        tar -xzf deploy_vision.tar.gz
        rm deploy_vision.tar.gz

        echo 'Configurando entorno de producción...'
        cp api/.env.prod api/.env

        echo 'Reconstruyendo contenedores...'
        docker compose up -d --build

        echo 'Esperando inicialización (5s)...'
        sleep 5

        echo 'Ejecutando migraciones Prisma...'
        docker exec pitayavisual-api npx prisma db push --accept-data-loss 2>/dev/null || true
        docker exec pitayavisual-api npx prisma generate 2>/dev/null || true

        echo 'Estado final de contenedores:'
        docker ps --filter name=pitayavisual

        echo 'Últimos logs API:'
        docker logs --tail 15 pitayavisual-api

        echo 'Últimos logs Web:'
        docker logs --tail 5 pitayavisual-web
"@

    ssh -i $SSH_KEY -o StrictHostKeyChecking=no root@$SERVER_IP $remoteCommands

    Write-Host "--- DESPLIEGUE VISION COMPLETADO CON ÉXITO ---" -ForegroundColor Green
}
catch {
    Write-Host "Error durante el despliegue: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    if (Test-Path "deploy_vision.tar.gz") { Remove-Item "deploy_vision.tar.gz" }
}
