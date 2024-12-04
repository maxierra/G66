const express = require('express');
const router = express.Router();
const db = require('../database/db');
const XLSX = require('xlsx');
const path = require('path');

// Ruta temporal para analizar el archivo Excel
router.get('/analizar-excel', (req, res) => {
    try {
        const excelPath = path.join(__dirname, '..', 'Pablo_2024-12-03.xls');
        const workbook = XLSX.readFile(excelPath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Obtener los encabezados (primera fila)
        const headers = data[0];
        
        res.json({
            success: true,
            columnCount: headers.length,
            headers: headers,
            firstRow: data[1] // Primera fila de datos
        });
    } catch (error) {
        console.error('Error al leer el archivo Excel:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/insertar-global', async (req, res) => {
    try {
        const { data } = req.body;
        
        // Query para insertar datos
        const query = `
            INSERT INTO db_globall66 (
                PROCESADA, MENSAJE, TIPOAUTORIZACION, OBSERVACION, 
                Bin, CuentaExterna, MontoImpactado, FeeMambu, 
                MonedaOrigen, visaTID, FILENAME, FILEPROCEFECHA, 
                ROWINFILE, DE3, DE4, DE6, DE12, DE24, DE25, DE38, 
                DE43, DE48, DE49, DE51, DE63, AUTOVISATID, CUPON, 
                MOVIMTIPO, CTA_INFI, AUTOID, AUTOCODI, AUTOFECHA, 
                CONSUAUTOCODI, CONSUFECHA, CONSUMIPOR, AUTOIMPOR, 
                ORIGEN_, DIFERENCIA, A_MAMBU, RELA_OK, ONL_OK, 
                STATUSMAMBU, Cuenta, Adicional, [Número Tarjeta], 
                Fecha, Importe, Moneda, [Importe Confirmado], 
                Internacional, [Importe Original], [Moneda Original], 
                Plan, Cuotas, [Código Autorización], [Número Comercio], 
                Estado, [Fecha Estado], Relacionada, [Nro.Cupón], 
                Origen, Rechazo, ICA, MCC, TCC, [Regla Fraude], 
                [Modo Entrada], [Terminal POS], [Stand-In], 
                [Id Autorización], [Estado de la Autorización del POS], 
                [Id Transaccion - Marca], MAMBULOGID, RECALLID, 
                ERRORCODE, ERRORSOURCE, ERRORREASON, 
                REQUESTMESSAGECOMPLETE, RESULTMESSAGECOMPLETE
            ) VALUES (${',?'.repeat(78).substring(1)})
        `;

        // Insertar cada fila de datos
        for (const row of data) {
            await new Promise((resolve, reject) => {
                db.run(query, [
                    row.PROCESADA, row.MENSAJE, row.TIPOAUTORIZACION, 
                    row.OBSERVACION, row.Bin, row.CuentaExterna, 
                    row.MontoImpactado, row.FeeMambu, row.MonedaOrigen, 
                    row.visaTID, row.FILENAME, row.FILEPROCEFECHA, 
                    row.ROWINFILE, row.DE3, row.DE4, row.DE6, row.DE12, 
                    row.DE24, row.DE25, row.DE38, row.DE43, row.DE48, 
                    row.DE49, row.DE51, row.DE63, row.AUTOVISATID, 
                    row.CUPON, row.MOVIMTIPO, row.CTA_INFI, row.AUTOID, 
                    row.AUTOCODI, row.AUTOFECHA, row.CONSUAUTOCODI, 
                    row.CONSUFECHA, row.CONSUMIPOR, row.AUTOIMPOR, 
                    row.ORIGEN_, row.DIFERENCIA, row.A_MAMBU, row.RELA_OK, 
                    row.ONL_OK, row.STATUSMAMBU, row.Cuenta, row.Adicional, 
                    row['Número Tarjeta'], row.Fecha, row.Importe, 
                    row.Moneda, row['Importe Confirmado'], row.Internacional, 
                    row['Importe Original'], row['Moneda Original'], 
                    row.Plan, row.Cuotas, row['Código Autorización'], 
                    row['Número Comercio'], row.Estado, row['Fecha Estado'], 
                    row.Relacionada, row['Nro.Cupón'], row.Origen, 
                    row.Rechazo, row.ICA, row.MCC, row.TCC, 
                    row['Regla Fraude'], row['Modo Entrada'], 
                    row['Terminal POS'], row['Stand-In'], 
                    row['Id Autorización'], 
                    row['Estado de la Autorización del POS'], 
                    row['Id Transaccion - Marca'], row.MAMBULOGID, 
                    row.RECALLID, row.ERRORCODE, row.ERRORSOURCE, 
                    row.ERRORREASON, row.REQUESTMESSAGECOMPLETE, 
                    row.RESULTMESSAGECOMPLETE
                ], function(err) {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }

        res.json({ 
            success: true, 
            message: 'Datos insertados correctamente' 
        });
    } catch (error) {
        console.error('Error al insertar datos:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;
