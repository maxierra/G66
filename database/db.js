const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Crear conexión a la base de datos
const db = new sqlite3.Database(path.join(__dirname, 'global.db'), (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
    } else {
        console.log('Conexión exitosa con la base de datos SQLite');
        createTable();
    }
});

// Crear la tabla db_globall66
function createTable() {
    db.run(`CREATE TABLE IF NOT EXISTS db_globall66 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        PROCESADA TEXT,
        MENSAJE TEXT,
        TIPOAUTORIZACION TEXT,
        OBSERVACION TEXT,
        Bin INTEGER,  -- Mantener como INTEGER
        CuentaExterna TEXT,  -- Cambiado a TEXT
        MontoImpactado REAL,  -- Mantener como REAL
        FeeMambu TEXT,
        MonedaOrigen TEXT,
        visaTID TEXT,
        FILENAME TEXT,
        FILEPROCEFECHA TEXT,
        ROWINFILE TEXT,
        DE3 INTEGER,
        DE4 TEXT,
        DE6 TEXT,
        DE12 TEXT,
        DE24 TEXT,
        DE25 TEXT,
        DE38 TEXT,
        DE43 TEXT,
        DE48 TEXT,
        DE49 TEXT,
        DE51 INTEGER,
        DE63 TEXT,
        AUTOVISATID TEXT,
        CUPON TEXT,
        MOVIMTIPO TEXT,
        CTA_INFI INTEGER,
        AUTOID TEXT,
        AUTOCODI INTEGER,
        AUTOFECHA TEXT,
        CONSUAUTOCODI TEXT,
        CONSUFECHA TEXT,
        CONSUMIPOR TEXT,
        AUTOIMPOR TEXT,
        ORIGEN_ TEXT,
        DIFERENCIA TEXT,
        A_MAMBU TEXT,
        RELA_OK TEXT,
        ONL_OK TEXT,
        STATUSMAMBU TEXT,
        Cuenta TEXT,
        Adicional TEXT,
        "Número Tarjeta" TEXT,
        Fecha TEXT,
        Importe TEXT,
        Moneda TEXT,
        "Importe Confirmado" TEXT,
        Internacional TEXT,
        "Importe Original" TEXT,
        "Moneda Original" TEXT,
        Plan TEXT,
        Cuotas TEXT,
        "Código Autorización" TEXT,
        "Número Comercio" TEXT,
        Estado TEXT,
        "Fecha Estado" TEXT,
        Relacionada TEXT,
        "Nro.Cupón" TEXT,
        Origen TEXT,
        Rechazo TEXT,
        ICA TEXT,
        MCC TEXT,
        TCC TEXT,
        "Regla Fraude" TEXT,
        "Modo Entrada" TEXT,
        "Terminal POS" TEXT,
        "Stand-In" TEXT,
        "Id Autorización" TEXT,
        "Estado de la Autorización del POS" TEXT,
        "Id Transaccion - Marca" TEXT,
        MAMBULOGID TEXT,
        RECALLID TEXT,
        ERRORCODE TEXT,
        ERRORSOURCE TEXT,
        ERRORREASON TEXT,
        REQUESTMESSAGECOMPLETE TEXT,
        RESULTMESSAGECOMPLETE TEXT
    )`, (err) => {
        if (err) {
            console.error('Error al crear la tabla db_globall66:', err);
        } else {
            console.log('Tabla db_globall66 creada o ya existente');
        }
    });
}

module.exports = db;