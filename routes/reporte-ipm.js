const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Ruta principal para mostrar la página
router.get('/', (req, res) => {
    res.render('reporte-ipm', { title: 'Reporte IPM' });
});

// Ruta para consultar datos por fecha
router.get('/consulta', (req, res) => {
    const fechaInput = req.query.fecha;
    const fecha = fechaInput.replace(/-/g, '/');
    
    const query = `
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
        ORDER BY CuentaExterna ASC
    `;
    
    db.all(query, [fecha], (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Error al consultar la base de datos' });
            return;
        }
        
        res.json(rows);
    });
});

module.exports = router;