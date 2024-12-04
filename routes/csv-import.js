const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const db = require('../database/db');
const fs = require('fs');

// Configurar multer para la carga de archivos
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    try {
        // Leer el archivo Excel
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convertir a JSON manteniendo los valores null
        const results = XLSX.utils.sheet_to_json(worksheet, {
            raw: false,
            defval: null,
            blankrows: true
        });

        // Obtener la fecha actual en formato YYYY-MM-DD
        const currentDate = new Date().toISOString().split('T')[0];

        // Iniciar transacción
        db.serialize(() => {
            // Primero verificar si ya existen registros para la fecha actual
            db.get(`SELECT COUNT(*) as count FROM db_globall66 WHERE DATE(FILEPROCEFECHA) = ?`, [currentDate], (err, row) => {
                if (err) {
                    console.error('Error al verificar registros existentes:', err);
                    return res.status(500).json({ 
                        success: false,
                        error: 'Error al verificar registros existentes'
                    });
                }

                if (row.count > 0) {
                    // Ya existen registros para esta fecha
                    return res.status(400).json({
                        success: false,
                        error: 'Ya existen registros procesados para el día de hoy'
                    });
                }

                // Si no hay registros para hoy, procedemos con la inserción
                db.run('BEGIN TRANSACTION');

                const stmt = db.prepare(`
                    INSERT INTO db_globall66 (
                        PROCESADA, MENSAJE, TIPOAUTORIZACION, OBSERVACION, Bin,
                        CuentaExterna, MontoImpactado, FeeMambu, MonedaOrigen,
                        visaTID, FILENAME, FILEPROCEFECHA, ROWINFILE,
                        DE3, DE4, DE6, DE12, DE24, DE25, DE38, DE43, DE48,
                        DE49, DE51, DE63, AUTOVISATID, CUPON, MOVIMTIPO,
                        CTA_INFI, AUTOID, AUTOCODI, AUTOFECHA, CONSUAUTOCODI, CONSUFECHA,
                        CONSUMIPOR, AUTOIMPOR, ORIGEN_, DIFERENCIA, A_MAMBU,
                        RELA_OK, ONL_OK, STATUSMAMBU, Cuenta, Adicional,
                        [Número Tarjeta], Fecha, Importe, Moneda, [Importe Confirmado],
                        Internacional, [Importe Original], [Moneda Original], Plan, Cuotas,
                        [Código Autorización], [Número Comercio], Estado, [Fecha Estado],
                        Relacionada, [Nro.Cupón], Origen, Rechazo, ICA, MCC, TCC,
                        [Regla Fraude], [Modo Entrada], [Terminal POS], [Stand-In],
                        [Id Autorización], [Estado de la Autorización del POS],
                        [Id Transaccion - Marca], MAMBULOGID, RECALLID, ERRORCODE,
                        ERRORSOURCE, ERRORREASON, REQUESTMESSAGECOMPLETE, RESULTMESSAGECOMPLETE
                    ) VALUES (${Array(79).fill('?').join(', ')})`
                );

                let successCount = 0;
                let errorCount = 0;

                results.forEach((row, index) => {
                    try {
                        // Convertir 'NULL' string a null
                        Object.keys(row).forEach(key => {
                            if (row[key] === 'NULL' || row[key] === '') {
                                row[key] = null;
                            }
                        });

                        const values = [
                            row.PROCESADA, row.MENSAJE, row.TIPOAUTORIZACION, row.OBSERVACION, row.Bin,
                            row.CuentaExterna, row.MontoImpactado, row.FeeMambu, row.MonedaOrigen,
                            row.visaTID, row.FILENAME, row.FILEPROCEFECHA, row.ROWINFILE,
                            row.DE3, row.DE4, row.DE6, row.DE12, row.DE24, row.DE25, row.DE38,
                            row.DE43, row.DE48, row.DE49, row.DE51, row.DE63, row.AUTOVISATID,
                            row.CUPON, row.MOVIMTIPO, row.CTA_INFI, row.AUTOID, row.AUTOCODI,
                            row.AUTOFECHA, row.CONSUAUTOCODI, row.CONSUFECHA, row.CONSUMIPOR,
                            row.AUTOIMPOR, row.ORIGEN_, row.DIFERENCIA, row.A_MAMBU, row.RELA_OK,
                            row.ONL_OK, row.STATUSMAMBU, row.Cuenta, row.Adicional,
                            row['Número Tarjeta'], row.Fecha, row.Importe, row.Moneda,
                            row['Importe Confirmado'], row.Internacional, row['Importe Original'],
                            row['Moneda Original'], row.Plan, row.Cuotas, row['Código Autorización'],
                            row['Número Comercio'], row.Estado, row['Fecha Estado'], row.Relacionada,
                            row['Nro.Cupón'], row.Origen, row.Rechazo, row.ICA, row.MCC, row.TCC,
                            row['Regla Fraude'], row['Modo Entrada'], row['Terminal POS'],
                            row['Stand-In'], row['Id Autorización'],
                            row['Estado de la Autorización del POS'], row['Id Transaccion - Marca'],
                            row.MAMBULOGID, row.RECALLID, row.ERRORCODE, row.ERRORSOURCE,
                            row.ERRORREASON, row.REQUESTMESSAGECOMPLETE, row.RESULTMESSAGECOMPLETE
                        ];

                        // Log para debugging de la primera fila
                        if (index === 0) {
                            console.log('Primera fila de datos:', values);
                        }

                        stmt.run(values);
                        successCount++;
                    } catch (error) {
                        console.error(`Error en fila ${index + 1}:`, error);
                        console.error('Datos de la fila:', row);
                        errorCount++;
                    }
                });

                stmt.finalize();

                db.run('COMMIT', (err) => {
                    if (err) {
                        console.error('Error al hacer commit:', err);
                        db.run('ROLLBACK');
                        return res.status(500).json({ 
                            error: 'Error al guardar los datos',
                            details: err.message 
                        });
                    }

                    // Eliminar el archivo temporal
                    fs.unlink(req.file.path, (err) => {
                        if (err) console.error('Error al eliminar archivo temporal:', err);
                    });

                    // Enviar respuesta JSON simple
                    return res.json({ success: true });
                });
            });
        });
    } catch (error) {
        console.error('Error al procesar el archivo:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Error al procesar el archivo',
            details: error.message 
        });
    }
});

module.exports = router;
