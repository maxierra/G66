const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Ruta para cargar datos globales
router.post('/cargar-datos-globales', async (req, res) => {
    try {
        const { data } = req.body;
        
        if (!Array.isArray(data) || data.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Los datos deben ser proporcionados en formato de array' 
            });
        }

        // Insertar los datos en la base de datos
        const query = `
            INSERT INTO db_globall66 (
                PROCESADA, MENSAJE, TIPOAUTORIZACION, OBSERVACION, Bin, CuentaExterna,
                MontoImpactado, FeeMambu, MonedaOrigen, visaTID, FILENAME, FILEPROCEFECHA,
                ROWINFILE, DE3, DE4, DE6, DE12, DE24, DE25, DE38, DE43, DE48, DE49, DE51,
                DE63, AUTOVISATID, CUPON, MOVIMTIPO, CTA_INFI, AUTOID, AUTOCODI, AUTOFECHA,
                CONSUAUTOCODI, CONSUFECHA, CONSUMIPOR, AUTOIMPOR, ORIGEN_, DIFERENCIA,
                A_MAMBU, RELA_OK, ONL_OK, STATUSMAMBU, Cuenta, Adicional, "Número Tarjeta",
                Fecha, Importe, Moneda, "Importe Confirmado", Internacional, "Importe Original",
                "Moneda Original", Plan, Cuotas, "Código Autorización", "Número Comercio",
                Estado, "Fecha Estado", Relacionada, "Nro.Cupón", Origen, Rechazo, ICA,
                MCC, TCC, "Regla Fraude", "Modo Entrada", "Terminal POS", "Stand-In",
                "Id Autorización", "Estado de la Autorización del POS",
                "Id Transaccion - Marca", MAMBULOGID, RECALLID, ERRORCODE, ERRORSOURCE,
                ERRORREASON, REQUESTMESSAGECOMPLETE, RESULTMESSAGECOMPLETE, fecha_carga
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
                $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28,
                $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41,
                $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54,
                $55, $56, $57, $58, $59, $60, $61, $62, $63, $64, $65, $66, $67,
                $68, $69, $70, $71, $72, $73, $74, $75, $76, CURRENT_TIMESTAMP
            )
        `;

        for (const row of data) {
            await db.query(query, [
                row.PROCESADA, row.MENSAJE, row.TIPOAUTORIZACION, row.OBSERVACION,
                row.Bin, row.CuentaExterna, row.MontoImpactado, row.FeeMambu,
                row.MonedaOrigen, row.visaTID, row.FILENAME, row.FILEPROCEFECHA,
                row.ROWINFILE, row.DE3, row.DE4, row.DE6, row.DE12, row.DE24,
                row.DE25, row.DE38, row.DE43, row.DE48, row.DE49, row.DE51,
                row.DE63, row.AUTOVISATID, row.CUPON, row.MOVIMTIPO, row.CTA_INFI,
                row.AUTOID, row.AUTOCODI, row.AUTOFECHA, row.CONSUAUTOCODI,
                row.CONSUFECHA, row.CONSUMIPOR, row.AUTOIMPOR, row.ORIGEN_,
                row.DIFERENCIA, row.A_MAMBU, row.RELA_OK, row.ONL_OK,
                row.STATUSMAMBU, row.Cuenta, row.Adicional, row['Número Tarjeta'],
                row.Fecha, row.Importe, row.Moneda, row['Importe Confirmado'],
                row.Internacional, row['Importe Original'], row['Moneda Original'],
                row.Plan, row.Cuotas, row['Código Autorización'],
                row['Número Comercio'], row.Estado, row['Fecha Estado'],
                row.Relacionada, row['Nro.Cupón'], row.Origen, row.Rechazo,
                row.ICA, row.MCC, row.TCC, row['Regla Fraude'],
                row['Modo Entrada'], row['Terminal POS'], row['Stand-In'],
                row['Id Autorización'], row['Estado de la Autorización del POS'],
                row['Id Transaccion - Marca'], row.MAMBULOGID, row.RECALLID,
                row.ERRORCODE, row.ERRORSOURCE, row.ERRORREASON,
                row.REQUESTMESSAGECOMPLETE, row.RESULTMESSAGECOMPLETE
            ]);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error al cargar datos globales:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al procesar los datos: ' + error.message 
        });
    }
});

module.exports = router;
