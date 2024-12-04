const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const db = require('../database/db');

router.post('/', async (req, res) => {
    try {
        const sqlFilePath = path.join(__dirname, '..', 'Pablo_2024-12-03.sql');
        console.log('Leyendo archivo SQL:', sqlFilePath);
        
        // Leer el archivo SQL
        const sqlContent = await fs.readFile(sqlFilePath, 'utf8');
        
        // Extraer los valores de los INSERT INTO statements
        const insertStatements = sqlContent.match(/INSERT INTO[^;]+;/g) || [];
        
        console.log(`Encontrados ${insertStatements.length} INSERT statements`);
        
        // Iniciar transacción
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            
            let successCount = 0;
            let errorCount = 0;
            
            // Procesar cada INSERT statement
            insertStatements.forEach((insertStmt, index) => {
                // Extraer los valores entre paréntesis
                const valuesMatch = insertStmt.match(/VALUES\s*\((.*?)\)/i);
                if (valuesMatch && valuesMatch[1]) {
                    const values = valuesMatch[1].split(',').map(val => {
                        val = val.trim();
                        // Remover comillas simples de los valores
                        if (val.startsWith("'") && val.endsWith("'")) {
                            return val.slice(1, -1);
                        }
                        return val === 'NULL' ? null : val;
                    });
                    
                    // Crear el INSERT statement para db_globall66
                    const stmt = db.prepare(`
                        INSERT INTO db_globall66 (
                            PROCESADA, MENSAJE, TIPOAUTORIZACION, OBSERVACION, Bin,
                            CuentaExterna, MontoImpactado, FeeMambu, MonedaOrigen,
                            visaTID, FILENAME, FILEPROCEFECHA, ROWINFILE,
                            DE3, DE4, DE6, DE12, DE24, DE25, DE38, DE43, DE48,
                            DE49, DE51, DE63, AUTOVISATID, CUPON, MOVIMTIPO,
                            CTA_INFI, AUTOID, AUTOCODI, AUTOFECHA, CONSUAUTOCODI, CONSUFECHA
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
                    
                    // Ejecutar el INSERT
                    stmt.run(...values.slice(0, 34), (err) => {
                        if (err) {
                            console.error(`Error en el INSERT ${index + 1}:`, err);
                            errorCount++;
                        } else {
                            successCount++;
                        }
                        
                        // Si es el último INSERT
                        if (index === insertStatements.length - 1) {
                            // Finalizar la transacción
                            db.run('COMMIT', (commitErr) => {
                                if (commitErr) {
                                    console.error('Error al hacer commit:', commitErr);
                                    db.run('ROLLBACK');
                                    res.status(500).json({
                                        success: false,
                                        message: 'Error al hacer commit de la transacción',
                                        error: commitErr.message
                                    });
                                } else {
                                    res.json({
                                        success: true,
                                        message: 'Importación SQL completada',
                                        stats: {
                                            total: insertStatements.length,
                                            successful: successCount,
                                            failed: errorCount
                                        }
                                    });
                                }
                            });
                        }
                    });
                    
                    stmt.finalize();
                }
            });
        });
    } catch (error) {
        console.error('Error al importar SQL:', error);
        res.status(500).json({
            success: false,
            message: 'Error al importar archivo SQL',
            error: error.message
        });
    }
});

module.exports = router;
