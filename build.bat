@echo off
echo Empaquetando G66...

echo 1. Limpiando carpeta dist anterior...
if exist "dist" rd /s /q "dist"

echo 2. Instalando dependencias...
call npm install

echo 3. Reconstruyendo módulos nativos...
call npm run postinstall

echo 4. Creando el instalador...
call npm run dist

echo.
echo ¡Proceso completado!
echo El instalador se encuentra en la carpeta 'dist'
echo Archivo: G66 Setup 1.0.0.exe
echo.

pause
