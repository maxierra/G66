const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const db = require('./database/db');

// Función para obtener la ruta base de la aplicación
function getAppPath() {
    if (process.type === 'renderer') {
        return path.join(process.resourcesPath, 'app');
    }
    if (process.env.ELECTRON_IS_DEV) {
        return __dirname;
    }
    return __dirname; // Default to __dirname if not in renderer or dev mode
}

// Función para crear directorio si no existe
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Directorio creado: ${dirPath}`);
    }
}

const app = express();
const appPath = getAppPath();

// Asegurar que los directorios necesarios existan
const directories = ['uploads', 'database', 'views', 'public'];
directories.forEach(dir => {
    ensureDirectoryExists(path.join(appPath, dir));
});

// Habilitar CORS
app.use(cors());

// Configuración de EJS
app.set('view engine', 'ejs');
app.set('views', path.join(appPath, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Middleware para parsear JSON y form data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos
app.use(express.static(path.join(appPath, 'public')));

// Middleware para debugging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Importar rutas
const globalesRouter = require('./routes/globales');
const importRouter = require('./routes/import');
const csvImportRouter = require('./routes/csv-import');
const rechazosRouter = require('./routes/rechazos');
const relacionadosRouter = require('./routes/relacionados');
const forzadasRouter = require('./routes/forzadas');

// Usar rutas
app.use('/globales', globalesRouter);
app.use('/import', importRouter);
app.use('/api/csv-import', csvImportRouter);
app.use('/rechazos', rechazosRouter);
app.use('/api/rechazos', rechazosRouter);
app.use('/relacionados', relacionadosRouter);
app.use('/api/relacionados', relacionadosRouter);
app.use('/forzadas', forzadasRouter);
app.use('/api/forzadas', forzadasRouter);

// Rutas de vistas
app.get('/', (req, res) => {
    console.log('Rendering inicio page');
    res.render('inicio', { 
        title: 'Inicio',
        message: 'Bienvenido al Dashboard'
    });
});

app.get('/carga-datos', (req, res) => {
    console.log('Rendering carga-datos page');
    res.render('carga-datos', { 
        title: 'Carga de Datos',
        message: req.query.message ? {
            type: req.query.type || 'info',
            text: req.query.message
        } : undefined
    });
});

app.get('/relacionados', (req, res) => {
    console.log('Rendering relacionados page');
    res.render('relacionados', { title: 'Relacionados' });
});

app.get('/no-ok', (req, res) => {
    console.log('Rendering no-ok page');
    res.render('no-ok', { title: 'No OK' });
});

app.get('/reporte-ipm', (req, res) => {
    console.log('Rendering reporte-ipm page');
    res.render('reporte-ipm', { title: 'Reporte IPM' });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        details: err.message 
    });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});

module.exports = app;
