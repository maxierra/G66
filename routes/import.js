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
        
        // Configurar opciones para la conversión a JSON
        const options = {
            raw: true,  // Obtener valores raw
            defval: null  // Valor por defecto para celdas vacías
        };
        
        // Convertir a JSON
        const data = XLSX.utils.sheet_to_json(worksheet, options);
        
        // Función para limpiar valores numéricos
        function cleanNumericValue(value) {
            if (value === null || value === undefined) return null;
            
            try {
                // Si es un número, convertirlo directamente
                if (typeof value === 'number') {
                    return Math.floor(value);
                }
                
                // Si es string, procesar
                let strValue = String(value).trim();
                
                // Remover cualquier caracter que no sea número
                strValue = strValue.replace(/[^\d]/g, '');
                
                // Convertir a número entero
                const numValue = parseInt(strValue, 10);
                
                if (isNaN(numValue)) {
                    console.log('Warning: Valor no numérico encontrado:', value);
                    return null;
                }
                
                console.log(`Limpiando valor: ${value} -> ${numValue}`);
                return numValue;
            } catch (error) {
                console.error('Error procesando valor:', value, error);
                return null;
            }
        }
        
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
                // Limpiar y convertir valores antes de la inserción
                const cleanDE3 = cleanNumericValue(row.DE3);
                const cleanDE51 = cleanNumericValue(row.DE51);
                const cleanCTA_INFI = cleanNumericValue(row.CTA_INFI);
                const cleanAUTOCODI = cleanNumericValue(row.AUTOCODI);

                console.log('Valores limpios a insertar:');
                console.log('DE3:', row.DE3, '->', cleanDE3);
                console.log('DE51:', row.DE51, '->', cleanDE51);
                console.log('CTA_INFI:', row.CTA_INFI, '->', cleanCTA_INFI);
                console.log('AUTOCODI:', row.AUTOCODI, '->', cleanAUTOCODI);

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
                    cleanDE3,
                    row.DE4 || null,
                    row.DE6 || null,
                    row.DE12 || null,
                    row.DE24 || null,
                    row.DE25 || null,
                    row.DE38 || null,
                    row.DE43 || null,
                    row.DE48 || null,
                    row.DE49 || null,
                    cleanDE51,
                    row.DE63 || null,
                    row.AUTOVISATID || null,
                    row.CUPON || null,
                    row.MOVIMTIPO || null,
                    cleanCTA_INFI,
                    row.AUTOID || null,
                    cleanAUTOCODI,
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
