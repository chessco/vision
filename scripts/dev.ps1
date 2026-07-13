# Pitaya Visual - Local Development Launcher
# Este script inicia la infraestructura Docker compartida, aplica migraciones y arranca API y Web en ventanas externas.

Write-Host "::: Iniciando Pitaya Visual Creative Suite en modo local :::" -ForegroundColor Cyan

# Determinar el directorio base (raíz de vision)
$ScriptDir = $PSScriptRoot
if (-not $ScriptDir) {
    $ScriptDir = Get-Location
}
$BaseDir = Split-Path $ScriptDir -Parent

# Asegurar que estamos en el directorio base correcto (raíz del proyecto)
Set-Location $BaseDir

# 1. Crear red de Docker si no existe
Write-Host "Verificando red Docker 'pitaya_net'..." -ForegroundColor Yellow
$netExists = docker network ls --filter name=pitaya_net -q
if (-not $netExists) {
    Write-Host "Creando red Docker 'pitaya_net'..." -ForegroundColor Gray
    docker network create pitaya_net
}

# 2. Iniciar bases de datos compartidas con PitayaCore
$CoreComposePath = Join-Path (Split-Path $BaseDir -Parent) "pitayacore\docker-compose.yml"
if (Test-Path $CoreComposePath) {
    Write-Host "Iniciando bases de datos de PitayaCore (Docker)..." -ForegroundColor Yellow
    docker compose -f $CoreComposePath up -d mysql postgres
} else {
    Write-Warning "No se encontro la ruta de PitayaCore en '$CoreComposePath'. Asegurate de que las bases de datos esten corriendo externamente en los puertos 3306 y 5434."
}

# 3. Sincronizar bases de datos y generar clientes Prisma
Write-Host "Sincronizando bases de datos y generando clientes Prisma..." -ForegroundColor Yellow
try {
    npm --prefix "$BaseDir\api" run prisma:generate
    npm --prefix "$BaseDir\api" run prisma:migrate
    Write-Host "Base de datos sincronizada con exito." -ForegroundColor Green
} catch {
    Write-Warning "No se pudo sincronizar automaticamente la base de datos."
}

# 4. Iniciar API (NestJS) en ventana externa
Write-Host "Iniciando Backend API (NestJS)..." -ForegroundColor Green
$ApiCommand = 'Set-Location "' + $BaseDir + '\api"; Write-Host ''--- PITAYA VISUAL API ---'' -ForegroundColor Cyan; npm run start:dev'
Start-Process powershell -WorkingDirectory "$BaseDir\api" -ArgumentList "-NoExit", "-Command", $ApiCommand

# 5. Iniciar Web (React + Vite) en ventana externa
Write-Host "Iniciando Frontend Web (Vite)..." -ForegroundColor Green
$WebCommand = 'Set-Location "' + $BaseDir + '\web"; Write-Host ''--- PITAYA VISUAL WEB ---'' -ForegroundColor Cyan; npm run dev'
Start-Process powershell -WorkingDirectory "$BaseDir\web" -ArgumentList "-NoExit", "-Command", $WebCommand

Write-Host "Todo listo. Las ventanas de desarrollo externas se han abierto." -ForegroundColor Green
Write-Host "API Local: http://localhost:3016" -ForegroundColor Gray
Write-Host "Web Local: http://localhost:3000" -ForegroundColor Gray
