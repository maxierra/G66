const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Ruta principal para mostrar la página
router.get('/', (req, res) => {
    res.render('rechazos');
});

// Ruta para consultar rechazos por fecha
router.get('/consulta', (req, res) => {
    const fecha = req.query.fecha;
    const vistaCompleta = req.query.vistaCompleta === 'true';
    
    let query;
    if (vistaCompleta) {
        query = `
            SELECT 
                PROCESADA, MENSAJE, TIPOAUTORIZACION, OBSERVACION, Bin, CuentaExterna,
                MontoImpactado, FeeMambu, MonedaOrigen, visaTID, FILENAME,
                FILEPROCEFECHA, ROWINFILE, DE3, DE4, DE6, DE12, DE24,
                DE25, DE38, DE43, DE48, DE49, DE51, DE63, AUTOVISATID,
                CUPON, MOVIMTIPO, CTA_INFI, AUTOID, AUTOCODI, AUTOFECHA,
                CONSUAUTOCODI, CONSUFECHA, CONSUMIPOR, AUTOIMPOR, ORIGEN_,
                DIFERENCIA, A_MAMBU, RELA_OK, ONL_OK, STATUSMAMBU, Cuenta,
                Adicional, "Número Tarjeta", Fecha, Importe, Moneda, "Importe Confirmado",
                Internacional, "Importe Original", "Moneda Original", Plan, Cuotas,
                "Código Autorización", "Número Comercio", Estado, "Fecha Estado",
                Relacionada, "Nro.Cupón", Origen, Rechazo, ICA, MCC, TCC,
                "Regla Fraude", "Modo Entrada", "Terminal POS", "Stand-In",
                "Id Autorización", "Estado de la Autorización del POS",
                "Id Transaccion - Marca", MAMBULOGID, RECALLID, ERRORCODE,
                ERRORSOURCE, ERRORREASON, REQUESTMESSAGECOMPLETE,
                RESULTMESSAGECOMPLETE
            FROM db_globall66 
            WHERE "Fecha Estado" LIKE ? || '%'
            AND RESULTMESSAGECOMPLETE LIKE '%StatusCode: 400%'
            ORDER BY 
                CAST(Bin AS INTEGER) DESC,
                CuentaExterna ASC,
                visaTID ASC
        `;
    } else {
        query = `
            SELECT 
                PROCESADA, MENSAJE, OBSERVACION, Bin, CuentaExterna, 
                MontoImpactado, visaTID, ORIGEN_, RECALLID, 
                ERRORCODE, ERRORSOURCE, ERRORREASON, 
                REQUESTMESSAGECOMPLETE, RESULTMESSAGECOMPLETE
            FROM db_globall66 
            WHERE "Fecha Estado" LIKE ? || '%'
            AND RESULTMESSAGECOMPLETE LIKE '%StatusCode: 400%'
            ORDER BY 
                CAST(Bin AS INTEGER) DESC,
                CuentaExterna ASC,
                visaTID ASC
        `;
    }

    const fechaFormateada = fecha.replace(/-/g, '/');
    
    db.all(query, [fechaFormateada], (err, rows) => {
        if (err) {
            console.error('Error al consultar rechazos:', err);
            return res.status(500).json({ error: 'Error al consultar los datos' });
        }
        res.json(rows || []);
    });
});

module.exports = router;
