param(
    [string]$mensaje = ""
)

# Verificar si el directorio ya es un repositorio Git
if (-not (Test-Path -Path ".git")) {
    git init
    git remote add origin https://github.com/maxierra/G66.git
    git branch -M main
}

# Crear .gitignore si no existe
if (-not (Test-Path -Path ".gitignore")) {
    @"
node_modules/
*.db
.env
uploads/
*.log
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8
}

# Configurar usuario de Git si no está configurado
$userEmail = git config user.email
if (-not $userEmail) {
    git config --global user.email "maxierra@example.com"
    git config --global user.name "Max Sierra"
}

# Si no se proporcionó mensaje, pedir uno
if ([string]::IsNullOrWhiteSpace($mensaje)) {
    $mensaje = Read-Host "Ingrese el mensaje de commit"
}

# Agregar todos los archivos
git add .

# Hacer commit con el mensaje proporcionado
git commit -m "$mensaje"

# Hacer push a la rama main
git push -u origin main

Write-Host "Proceso completado exitosamente" -ForegroundColor Green
