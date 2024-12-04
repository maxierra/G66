const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Ruta principal para mostrar la página
router.get('/', (req, res) => {
    console.log('Accediendo a la página de relacionados');
    res.render('relacionados');
});

// Ruta para consultar relacionados por fecha
router.post('/consulta', async (req, res) => {
    console.log('Recibida petición POST /api/relacionados/consulta');
    console.log('Body recibido:', req.body);
    const fecha = req.body.fecha;
    console.log('Fecha recibida:', fecha);
    
    // Primero, hagamos una consulta para ver algunos ejemplos de fechas en la base de datos
    const queryFechas = `
        SELECT FILEPROCEFECHA 
        FROM db_globall66 
        WHERE A_MAMBU = 'SI' AND RELA_OK = 'NO'
        LIMIT 5
    `;
    
    console.log('Consultando ejemplos de fechas...');
    
    try {
        // Primero consultamos ejemplos de fechas
        const fechasEjemplo = await new Promise((resolve, reject) => {
            db.all(queryFechas, [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
        
        console.log('Ejemplos de fechas en la DB:', fechasEjemplo);
        
        // Ahora hacemos la consulta principal
        const query = `
            SELECT 
                PROCESADA, MENSAJE, FILEPROCEFECHA, DE3, DE4, DE6, DE24,
                DE25, DE38, DE43, DE49, DE51, DE63, AUTOVISATID,
                CTA_INFI, AUTOCODI, AUTOFECHA, CONSUFECHA, CONSUMIPOR,
                AUTOIMPOR, ORIGEN_, DIFERENCIA, A_MAMBU, RELA_OK,
                ONL_OK, STATUSMAMBU
            FROM db_globall66 
            WHERE A_MAMBU = 'SI'
            AND RELA_OK = 'NO'
            ORDER BY FILEPROCEFECHA DESC
            LIMIT 100
        `;

        console.log('Ejecutando consulta principal sin filtro de fecha');
        
        const rows = await new Promise((resolve, reject) => {
            db.all(query, [], (err, rows) => {
                if (err) {
                    console.error('Error en la consulta SQL:', err);
                    reject(err);
                }
                console.log('Número de filas obtenidas:', rows ? rows.length : 0);
                if (rows && rows.length > 0) {
                    console.log('Primera fila:', rows[0]);
                } else {
                    console.log('No hay datos que cumplan las condiciones A_MAMBU = SI y RELA_OK = NO');
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
