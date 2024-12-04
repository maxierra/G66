#!/bin/bash

# Mensaje de commit por defecto
MENSAJE="${1}"

# Verificar si el directorio ya es un repositorio Git
if [ ! -d ".git" ]; then
    git init
    git remote add origin https://github.com/maxierra/G66.git
    git branch -M main
fi

# Crear .gitignore si no existe
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << EOL
node_modules/
*.db
.env
uploads/
*.log
EOL
fi

# Configurar usuario de Git si no está configurado
if [ -z "$(git config user.email)" ]; then
    git config --global user.email "maxierra@example.com"
    git config --global user.name "Max Sierra"
fi

# Si no se proporcionó mensaje, pedir uno
if [ -z "$MENSAJE" ]; then
    read -p "Ingrese el mensaje de commit: " MENSAJE
fi

# Agregar todos los archivos
git add .

# Hacer commit con el mensaje proporcionado
git commit -m "$MENSAJE"

# Hacer push a la rama main
git push -u origin main

echo "Proceso completado exitosamente"
