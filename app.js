const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const cors = require('cors');

const app = express();

// Habilitar CORS
app.use(cors());

// Configuración de EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Middleware para parsear JSON y form data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

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

// Usar rutas
app.use('/globales', globalesRouter);
app.use('/import', importRouter);
app.use('/api/csv-import', csvImportRouter);
app.use('/rechazos', rechazosRouter);
app.use('/api/rechazos', rechazosRouter);
app.use('/relacionados', relacionadosRouter);
app.use('/api/relacionados', relacionadosRouter);

// Rutas de vistas
app.get('/', (req, res) => {
    res.render('inicio', { title: 'Inicio' });
});

app.get('/carga-datos', (req, res) => {
    res.render('carga-datos', { 
        title: 'Carga de Datos',
        message: req.query.message ? {
            type: req.query.type || 'info',
            text: req.query.message
        } : undefined
    });
});

app.get('/relacionados', (req, res) => {
    res.render('relacionados', { title: 'Relacionados' });
});

app.get('/no-ok', (req, res) => {
    res.render('no-ok', { title: 'No OK' });
});

app.get('/reporte-ipm', (req, res) => {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
