# Función para mostrar mensajes con color
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Green "=== Iniciando proceso de empaquetado de G66 ==="
Write-Output ""

# 1. Limpiar carpeta dist
Write-ColorOutput Cyan "1. Limpiando carpeta dist anterior..."
if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
    Write-Output "   Carpeta dist eliminada"
} else {
    Write-Output "   No existe carpeta dist para limpiar"
}

# 2. Instalar dependencias
Write-ColorOutput Cyan "2. Instalando dependencias..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput Red "Error al instalar dependencias"
    exit 1
}

# 3. Reconstruir módulos nativos
Write-ColorOutput Cyan "3. Reconstruyendo módulos nativos..."
npm run postinstall
if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput Red "Error al reconstruir módulos nativos"
    exit 1
}

# 4. Crear el instalador
Write-ColorOutput Cyan "4. Creando el instalador..."
npm run dist
if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput Red "Error al crear el instalador"
    exit 1
}

Write-Output ""
Write-ColorOutput Green "=== ¡Proceso completado con éxito! ==="
Write-Output ""
Write-Output "El instalador se encuentra en:"
Write-Output "   $(Resolve-Path 'dist\G66 Setup 1.0.0.exe')"
Write-Output ""
Write-Output "Presiona cualquier tecla para salir..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
