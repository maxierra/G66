const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Ruta principal para mostrar la página
router.get('/', (req, res) => {
    console.log('Accediendo a la página de dashboards');
    res.render('dashboards');
});

// Ruta para obtener datos de los dashboards
router.get('/datos', async (req, res) => {
    try {
        // Aquí irá la lógica para obtener los datos de los dashboards
        // Por ahora retornamos un objeto vacío
        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Error al obtener datos de dashboards:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los datos de dashboards',
            error: error.message
        });
    }
});

module.exports = router;
