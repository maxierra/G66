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
        
        // Dividir el contenido en declaraciones SQL individuales
        const sqlStatements = sqlContent
            .split(';')
            .filter(stmt => stmt.trim())
            .map(stmt => stmt.trim());
        
        console.log(`Encontradas ${sqlStatements.length} declaraciones SQL`);
        
        // Ejecutar las declaraciones SQL en una transacción
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            
            let successCount = 0;
            let errorCount = 0;
            
            sqlStatements.forEach((stmt, index) => {
                if (stmt.trim()) {
                    db.run(stmt, (err) => {
                        if (err) {
                            console.error(`Error en la declaración ${index + 1}:`, err);
                            errorCount++;
                        } else {
                            successCount++;
                        }
                        
                        // Si es la última declaración
                        if (index === sqlStatements.length - 1) {
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
                                            total: sqlStatements.length,
                                            successful: successCount,
                                            failed: errorCount
                                        }
                                    });
                                }
                            });
                        }
                    });
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
