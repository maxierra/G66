const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Ruta principal para mostrar la página
router.get('/', (req, res) => {
    console.log('Accediendo a la página de forzadas');
    res.render('forzadas');
});

// Ruta para consultar relacionados por fecha con filtros de "FORZADA"
router.post('/consulta', async (req, res) => {
    console.log('Recibida petición POST /api/forzadas/consulta');
    console.log('Body recibido:', req.body);
    let fecha = req.body.fecha;
    
    // Convertir el formato de fecha de YYYY-MM-DD a YYYY/MM/DD
    if (fecha) {
        fecha = fecha.replace(/-/g, '/');
        console.log('Fecha formateada para búsqueda:', fecha);
    }

    try {
        // Consulta principal con filtros específicos
        const query = `
            SELECT 
                PROCESADA, MENSAJE, FILEPROCEFECHA, DE3, DE4, DE6, DE24,
                DE25, DE38, DE43, DE49, DE51, DE63, AUTOVISATID,
                CTA_INFI, AUTOCODI, AUTOFECHA, CONSUFECHA, CONSUMIPOR,
                AUTOIMPOR, ORIGEN_, DIFERENCIA, A_MAMBU, RELA_OK,
                ONL_OK, STATUSMAMBU
            FROM db_globall66 
            WHERE ORIGEN_ LIKE '%FORZADA en cierre lote%'
            AND RELA_OK = 'SI'
            AND RESULTMESSAGECOMPLETE LIKE '%StatusCode: 200%'
            AND FILEPROCEFECHA LIKE ? || '%'
            ORDER BY CAST(DE51 AS INTEGER), DE3, CTA_INFI, AUTOCODI
            LIMIT 100
        `;

        console.log('Ejecutando consulta principal...');
        console.log('Query completa:', query);
        console.log('Parámetros:', [fecha]);
        
        const rows = await new Promise((resolve, reject) => {
            db.all(query, [fecha], (err, rows) => {
                if (err) {
                    console.error('Error en la consulta SQL:', err);
                    reject(err);
                }
                console.log('Número de filas obtenidas:', rows ? rows.length : 0);
                if (rows && rows.length > 0) {
                    console.log('Primera fila obtenida:', rows[0]);
                } else {
                    console.warn('No hay datos que cumplan los filtros especificados.');
                }
                resolve(rows);
            });
        });

        console.log('Enviando respuesta al cliente');
        res.json(rows);
    } catch (error) {
        console.error('Error en la consulta:', error);
        res.status(500).json({ error: 'Error al consultar los datos', details: error.message });
    }
});

module.exports = router;
