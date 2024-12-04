const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const path = require('path');
const db = require('../database/db');

// Función para leer el archivo Excel y guardar en la base de datos
function importExcelToDb(filePath) {
    try {
        // Leer el archivo Excel
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convertir a JSON
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        // Preparar la consulta SQL
        const stmt = db.prepare(`INSERT INTO db_globall66 (
            PROCESADA, MENSAJE, TIPOAUTORIZACION, OBSERVACION, Bin,
            CuentaExterna, MontoImpactado, FeeMambu, MonedaOrigen,
            visaTID, FILENAME, FILEPROCEFECHA, ROWINFILE,
            DE3, DE4, DE6, DE12, DE24, DE25, DE38, DE43, DE48,
            DE49, DE51, DE63, AUTOVISATID, CUPON, MOVIMTIPO,
            CTA_INFI, AUTOID, AUTOCODI, AUTOFECHA, CONSUAUTOCODI, CONSUFECHA
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

        // Iniciar una transacción
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            
            data.forEach((row) => {
                stmt.run(
                    row.PROCESADA || null,
                    row.MENSAJE || null,
                    row.TIPOAUTORIZACION || null,
                    row.OBSERVACION || null,
                    row.Bin || null,
                    row.CuentaExterna || null,
                    row.MontoImpactado || null,
                    row.FeeMambu || null,
                    row.MonedaOrigen || null,
                    row.visaTID || null,
                    row.FILENAME || null,
                    row.FILEPROCEFECHA || null,
                    row.ROWINFILE || null,
                    row.DE3 || null,
                    row.DE4 || null,
                    row.DE6 || null,
                    row.DE12 || null,
                    row.DE24 || null,
                    row.DE25 || null,
                    row.DE38 || null,
                    row.DE43 || null,
                    row.DE48 || null,
                    row.DE49 || null,
                    row.DE51 || null,
                    row.DE63 || null,
                    row.AUTOVISATID || null,
                    row.CUPON || null,
                    row.MOVIMTIPO || null,
                    row.CTA_INFI || null,
                    row.AUTOID || null,
                    row.AUTOCODI || null,
                    row.AUTOFECHA || null,
                    row.CONSUAUTOCODI || null,
                    row.CONSUFECHA || null
                );
            });
            
            db.run('COMMIT', (err) => {
                if (err) {
                    console.error('Error al hacer commit:', err);
                    db.run('ROLLBACK');
                } else {
                    console.log('Datos importados exitosamente');
                }
            });
        });

        stmt.finalize();
        return { success: true, message: 'Importación completada con éxito' };
    } catch (error) {
        console.error('Error al importar datos:', error);
        return { success: false, message: error.message };
    }
}

// Ruta para importar el archivo
router.post('/', (req, res) => {
    console.log('Recibida petición POST en /api/import');
    try {
        const filePath = path.join(__dirname, '..', 'Pablo_2024-12-03.xls');
        console.log('Intentando leer archivo:', filePath);
        const result = importExcelToDb(filePath);
        res.json(result);
    } catch (error) {
        console.error('Error en la ruta de importación:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
