function trackDataCount(step, data) {
    switch (step) {
        case 'DB':
            break;
        case 'Textarea':
            break;
        case 'Clasificación':
            break;
        case 'HTML':
            break;
        default:
            break;
    }
}

// Definición global de headers
const headers = [
    "PROCESADA", "MENSAJE", "TIPOAUTORIZACION", "OBSERVACION", "Bin", "CuentaExterna",
    "MontoImpactado", "FeeMambu", "MonedaOrigen", "visaTID", "FILENAME",
    "FILEPROCEFECHA", "ROWINFILE", "DE3", "DE4", "DE6", "DE12", "DE24",
    "DE25", "DE38", "DE43", "DE48", "DE49", "DE51", "DE63", "AUTOVISATID",
    "CUPON", "MOVIMTIPO", "CTA_INFI", "AUTOID", "AUTOCODI", "AUTOFECHA",
    "CONSUAUTOCODI", "CONSUFECHA", "CONSUMIPOR", "AUTOIMPOR", "ORIGEN_",
    "DIFERENCIA", "A_MAMBU", "RELA_OK", "ONL_OK", "STATUSMAMBU", "Cuenta",
    "Adicional", "Número Tarjeta", "Fecha", "Importe", "Moneda", "Importe Confirmado",
    "Internacional", "Importe Original", "Moneda Original", "Plan", "Cuotas",
    "Código Autorización", "Número Comercio", "Estado", "Fecha Estado",
    "Relacionada", "Nro.Cupón", "Origen", "Rechazo", "ICA", "MCC", "TCC",
    "Regla Fraude", "Modo Entrada", "Terminal POS", "Stand-In",
    "Id Autorización", "Estado de la Autorización del POS",
    "Id Transaccion - Marca", "MAMBULOGID", "RECALLID", "ERRORCODE",
    "ERRORSOURCE", "ERRORREASON", "REQUESTMESSAGECOMPLETE",
    "RESULTMESSAGECOMPLETE"
];

// Variables globales para las tablas
let tablaChile = [];
let tablaPeru = [];
let tablaOtros = [];

async function obtenerDatos() {
    const fecha = document.getElementById('fechaConsulta').value;

    if (!fecha) {
        alert('Por favor, seleccione una fecha');
        return;
    }

    try {
        const response = await fetch(`/reporte-ipm/consulta?fecha=${fecha}`);
        if (!response.ok) {
            throw new Error('Error en la consulta');
        }
        const data = await response.json();
        console.log('1. Registros recibidos de DB:', data.length);
        
        // Log para ver la estructura del primer registro
        console.log('Estructura del primer registro:', data[0]);
        console.log('Headers disponibles:', headers);
        
        // Mantener como array, sin usar join/split
        const formattedRows = data.map(row => {
            return headers.map(header => {
                const value = row[header];
                if (value === null || value === undefined) {
                    return '';
                }
                if (header === 'REQUESTMESSAGECOMPLETE' || header === 'RESULTMESSAGECOMPLETE') {
                    return value.replace(/\r\n/g, '\\n').replace(/\n/g, '\\n');
                }
                return value;
            });
        });

        console.log('2. Registros después de formatear:', formattedRows.length);
        console.log('Ejemplo de registro formateado:', formattedRows[0]);

        // Actualizar textarea (solo para visualización)
        document.getElementById('dataInput').value = formattedRows.map(row => row.join('\t')).join('\n');

        // Procesar los datos manteniendo el array
        processData(formattedRows);
    } catch (error) {
        console.error('Error completo:', error);
        alert('Error al obtener los datos');
    }
}

async function processData(rows) {
    console.log('3. Registros a procesar:', rows.length);
    
    // Limpiar las tablas antes de procesar
    tablaChile = [];
    tablaPeru = [];
    tablaOtros = [];
    
    let chileCount = 0;
    let peruCount = 0;
    let otherCount = 0;

    const processedRows = rows.map((row, index) => processTableRow(row, headers, index));

    processedRows.forEach(row => {
        // Convertir el BIN a string para la comparación
        const binStr = String(row.bin);
        if (binStr === '555505') {
            chileCount++;
            tablaChile.push(row);
        } else if (binStr === '523510') {
            peruCount++;
            tablaPeru.push(row);
        } else {
            otherCount++;
            tablaOtros.push(row);
        }
    });

    console.log('4. Registros clasificados:');
    console.log('   - Chile:', chileCount);
    console.log('   - Perú:', peruCount);
    console.log('   - Otros:', otherCount);
    console.log('   - Total:', chileCount + peruCount + otherCount);

    updateTables(tablaChile, tablaPeru, tablaOtros);
}

function processTableRow(row, headers, index) {
    // Log para diagnóstico
    if (index === 0) {
        console.log('Procesando fila:', row);
        console.log('Headers:', headers);
    }

    // Extraer valores necesarios usando los índices correctos
    const binIndex = headers.indexOf('Bin');
    const cuentaExternaIndex = headers.indexOf('CuentaExterna');
    const origenIndex = headers.indexOf('ORIGEN_');
    const mensajeIndex = headers.indexOf('MENSAJE');
    
    const binValue = row[binIndex];
    const cuentaExterna = row[cuentaExternaIndex] || '';
    const origen = row[origenIndex] || '';

    return {
        bin: binValue,
        cuentaExterna,
        origen,
        mensaje: row[mensajeIndex],
        montoImpactado: row[headers.indexOf('MontoImpactado')],
        columns: row
    };
}

function updateTables(chileCases, peruCases, otrosCases) {
    console.log('\n=== ACTUALIZANDO TABLAS ===');
    console.log('Casos Chile:', chileCases.length);
    console.log('Casos Perú:', peruCases.length);
    console.log('Otros casos:', otrosCases.length);

    // Generar HTML para cada caso
    let html = '';

    // Casos Chile
    chileCases.forEach((caso, index) => {
        logTableInfo('Chile', index + 1, caso);
        html += generateCaseHTML(caso, index + 1, 'Chile');
    });

    // Casos Perú
    peruCases.forEach((caso, index) => {
        logTableInfo('Perú', index + 1, caso);
        html += generateCaseHTML(caso, index + 1, 'Perú');
    });

    // Casos Otros
    otrosCases.forEach((caso, index) => {
        logTableInfo('Otros', index + 1, caso);
        html += generateCaseHTML(caso, index + 1, 'Otros');
    });

    // Actualizar el contenedor
    const container = document.getElementById('caseContainer');
    container.innerHTML = html;
}

function generateCaseHTML(caso, index, tipo) {
    const authHeaders = [
        "Cuenta", "Adicional", "Número Tarjeta", "Fecha", "Importe", 
        "Moneda", "Importe Confirmado", "Internacional", "Importe Original", 
        "Moneda Original", "Plan", "Cuotas", "Código Autorización", 
        "Número Comercio", "Estado", "Fecha Estado", "Relacionada", 
        "Nro.Cupón", "Origen", "Rechazo", "ICA", "MCC", "TCC", 
        "Regla Fraude", "Modo Entrada", "Terminal POS", "Stand-In", 
        "Id Autorización", "Estado de la Autorización del POS",
        "Id Transaccion - Marca"
    ];

    const presHeaders = [
        "FILEPROCEFECHA", "DE3", "DE4", "DE6", "DE24", "DE25", "DE38",
        "DE43", "DE49", "DE51", "DE63", "AUTOVISATID", "CTA_INFI",
        "AUTOCODI", "AUTOFECHA", "CONSUFECHA", "CONSUMIPOR", "AUTOIMPOR",
        "ORIGEN_", "DIFERENCIA"
    ];

    const mambuHeaders = [
        "REQUESTMESSAGECOMPLETE", "RESULTMESSAGECOMPLETE"
    ];

    // Generar las tablas
    const authTable = `
        <div class="table-title">Datos de Autorización:</div>
        <div class="table-responsive">
            <table id="tableauth${tipo}${index}">
                <thead>
                    <tr>${authHeaders.map(header => `<th>${header}</th>`).join('')}</tr>
                </thead>
                <tbody>
                    <tr>
                        ${authHeaders.map(header => {
                            const columnIndex = headers.indexOf(header);
                            return `<td>${columnIndex >= 0 ? caso.columns[columnIndex] || '' : ''}</td>`;
                        }).join('')}
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    const presTable = `
        <div class="table-title">Datos de Presentación:</div>
        <div class="table-responsive">
            <table id="tablepres${tipo}${index}">
                <thead>
                    <tr>${presHeaders.map(header => `<th>${header}</th>`).join('')}</tr>
                </thead>
                <tbody>
                    <tr>
                        ${presHeaders.map(header => {
                            const columnIndex = headers.indexOf(header);
                            return `<td>${columnIndex >= 0 ? caso.columns[columnIndex] || '' : ''}</td>`;
                        }).join('')}
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    const mambuTable = `
        <div class="table-title">Datos de Mambu:</div>
        <div class="table-responsive">
            <table id="tablemambu${tipo}${index}">
                <thead>
                    <tr>${mambuHeaders.map(header => `<th>${header}</th>`).join('')}</tr>
                </thead>
                <tbody>
                    <tr>
                        ${mambuHeaders.map(header => {
                            const columnIndex = headers.indexOf(header);
                            return `<td>${columnIndex >= 0 ? caso.columns[columnIndex] || '' : ''}</td>`;
                        }).join('')}
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    // Generar las secciones de inserción
    const insertSections = `
        <div class="insert-sections">
            <div class="input-group">
                <h3 class="insert-title">Insertar en Autorización:</h3>
                <textarea id="authDataInput${tipo}${index}" placeholder="Pegar datos de Autorización aquí..." style="width: 100%; min-height: 100px;"></textarea>
                <button onclick="addRow('auth', '${tipo}', ${index})">Agregar Filas Autorización</button>
            </div>
            <div class="input-group">
                <h3 class="insert-title">Insertar en Presentación:</h3>
                <textarea id="presDataInput${tipo}${index}" placeholder="Pegar datos de Presentación aquí..." style="width: 100%; min-height: 100px;"></textarea>
                <button onclick="addRow('pres', '${tipo}', ${index})">Agregar Filas Presentación</button>
            </div>
            <div class="input-group">
                <h3 class="insert-title">Insertar en Mambu:</h3>
                <textarea id="mambuDataInput${tipo}${index}" placeholder="Pegar datos de Mambu aquí..." style="width: 100%; min-height: 100px;"></textarea>
                <button onclick="addRow('mambu', '${tipo}', ${index})">Agregar Filas Mambu</button>
            </div>
        </div>
    `;

    // Construir el HTML completo
    let html = `
        <div class="case-container ${tipo.toLowerCase()}-case">
            <div class="case-header">
                <input type="checkbox" class="case-checkbox" data-case="${index}">
                <h3>Caso ${tipo} #${index}</h3>
            </div>
            <div><strong>CUENTA EXTERNA:</strong> ${caso.cuentaExterna}</div>
            <div><strong>MONTO:</strong> ${caso.montoImpactado}</div>
            <div><strong>ORIGEN:</strong> ${caso.origen}</div>
            <div class="mensaje-container">
                <strong>MENSAJE:</strong>
                <div id="mensajeDisplay${tipo}${index}" style="display: block;">${caso.mensaje || ''}</div>
                <div id="mensajeEdit${tipo}${index}" style="display: none;">
                    <textarea id="mensaje${tipo}${index}" class="mensaje-textarea" rows="3">${caso.mensaje || ''}</textarea>
                    <button onclick="guardarMensaje('${tipo}', ${index})" class="mensaje-save-btn">Guardar Mensaje</button>
                    <button onclick="cancelarEdicion('${tipo}', ${index})" class="mensaje-cancel-btn">Cancelar</button>
                </div>
                <button onclick="editarMensaje('${tipo}', ${index})" id="editBtn${tipo}${index}" class="mensaje-edit-btn">Editar</button>
            </div>
            
            <!-- Primero todas las tablas -->
            <div class="tables-section">
                ${authTable}
                ${presTable}
                ${mambuTable}
            </div>

            <!-- Luego todas las secciones de inserción -->
            ${insertSections}
        </div>
    `;

    return html;
}

function logTableInfo(country, caseNumber, caseData) {
    console.log(`Caso ${country} #${caseNumber}:`, {
        cuentaExterna: caseData.cuentaExterna,
        origen: caseData.origen,
        bin: caseData.bin
    });
}

function createTableRow(columns) {
    const row = document.createElement('tr');
    headers.forEach(header => {
        const columnIndex = headers.indexOf(header);
        const cellValue = columns[columnIndex] || '';
        row.innerHTML += `<td>${cellValue}</td>`;
    });
    return row;
}

function addRow(type, country, caseNumber) {
    const tableId = `#table${type}${country}${caseNumber}`;
    const table = document.querySelector(tableId);

    if (!table) {
        return;
    }

    const inputElement = document.getElementById(`${type}DataInput${country}${caseNumber}`);
    const dataInput = inputElement.value;

    if (!dataInput.trim()) {
        return;
    }

    const rows = dataInput.split('\n');

    rows.forEach(row => {
        const trimmedRow = row.trim();

        if (trimmedRow.length === 0) {
            return;
        }

        const dataColumns = trimmedRow.split('\t');
        const newRow = table.insertRow();

        dataColumns.forEach(data => {
            const newCell = newRow.insertCell();

            newCell.textContent = (data === 'null' || data.trim() === '') ? 'N/A' : data;
        });

        const deleteButtonHTML = `<button onclick="deleteRow(this)">Eliminar</button>`;
        const actionCell = newRow.insertCell();
        actionCell.innerHTML = deleteButtonHTML;
    });

    // Limpiar el textarea después de insertar los datos
    inputElement.value = '';
    
    // Opcional: Mostrar un mensaje de éxito
    const rowCount = rows.filter(row => row.trim().length > 0).length;
    if (rowCount > 0) {
        alert(`Se insertaron ${rowCount} fila(s) correctamente`);
    }
}

function deleteRow(button) {
    const row = button.closest('tr');
    row.parentNode.removeChild(row);
}

function unificarCasos() {
    const selectedCheckboxes = document.querySelectorAll('.case-checkbox:checked');

    if (selectedCheckboxes.length < 2) {
        alert('Por favor, selecciona al menos dos casos para unificar.');
        return;
    }

    let selectedCases = Array.from(selectedCheckboxes).map(checkbox => {
        const caseNum = parseInt(checkbox.getAttribute('data-case'));
        const container = checkbox.closest('.case-container');
        const binValue = container.getAttribute('data-case-bin');
        return { caseNum, binValue };
    });

    const casesByBin = {};
    selectedCases.forEach(caseInfo => {
        if (!casesByBin[caseInfo.binValue]) {
            casesByBin[caseInfo.binValue] = [];
        }
        casesByBin[caseInfo.binValue].push(caseInfo.caseNum);
    });

    if (Object.keys(casesByBin).length > 1) {
        alert('Error: No se pueden unificar casos de diferentes países.');
        return;
    }

    const binValue = Object.keys(casesByBin)[0];
    const casesForBin = casesByBin[binValue].sort((a, b) => a - b);

    const caseToKeep = casesForBin[0];
    const casesToRemove = casesForBin.slice(1);

    casesToRemove.forEach(caseNum => {
        combineCaseData(caseToKeep, caseNum);
    });

    casesToRemove.forEach(caseNum => {
        const caseElement = document.querySelector(`.case-container[data-case="${caseNum}"][data-case-bin="${binValue}"]`);
        if (caseElement) {
            caseElement.remove();
        }
    });

    actualizarCasoUnificado(caseToKeep, binValue);

    renumerarTodosLosCasos();
}

function renumerarTodosLosCasos() {
    const chileCases = Array.from(document.querySelectorAll('.case-container[data-case-bin="555505"]'));
    const peruCases = Array.from(document.querySelectorAll('.case-container[data-case-bin="523510"]'));

    renumerarCasosPorPais(chileCases, 'Chile', 1);
    renumerarCasosPorPais(peruCases, 'Perú', 1);

    asegurarCheckboxesEnTodosCasos();
}

function renumerarCasosPorPais(casos, pais, startNumber) {
    let nextNumber = startNumber;

    const sortedCases = casos.sort((a, b) => {
        return parseInt(a.getAttribute('data-case')) - parseInt(b.getAttribute('data-case'));
    });

    sortedCases.forEach(caseElement => {
        updateCaseNumber(caseElement, nextNumber, pais);
        nextNumber++;
    });
}

function asegurarCheckboxesEnTodosCasos() {
    const todosLosCasos = document.querySelectorAll('.case-container');

    todosLosCasos.forEach(caso => {
        const numeroCaso = caso.getAttribute('data-case');

        let checkboxDiv = caso.querySelector('.checkbox-container');

        if (!checkboxDiv) {
            checkboxDiv = document.createElement('div');
            checkboxDiv.className = 'checkbox-container';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'case-checkbox';
            checkbox.setAttribute('data-case', numeroCaso);

            checkboxDiv.appendChild(checkbox);
            caso.insertBefore(checkboxDiv, caso.firstChild);
        }

        const checkbox = checkboxDiv.querySelector('.case-checkbox');
        if (checkbox) {
            checkbox.disabled = false;
            checkbox.checked = false;
        }
    });
}

function actualizarCasoUnificado(caseToKeep, binValue) {
    const caseToKeepElement = document.querySelector(`.case-container[data-case="${caseToKeep}"]`);

    if (caseToKeepElement) {
        const caseTitle = caseToKeepElement.querySelector('.case-header');
        if (caseTitle) {
            caseTitle.textContent = `Caso ${caseToKeep} (Unificado)`;
        }

        let checkboxContainer = caseToKeepElement.querySelector('.checkbox-container');
        if (!checkboxContainer) {
            checkboxContainer = document.createElement('div');
            checkboxContainer.className = 'checkbox-container';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'case-checkbox';
            checkbox.setAttribute('data-case', caseToKeep);

            checkboxContainer.appendChild(checkbox);
            caseToKeepElement.insertBefore(checkboxContainer, caseToKeepElement.firstChild);
        }

        const insertContainers = ['auth', 'pres', 'mambu'];
        insertContainers.forEach(type => {
            let container = caseToKeepElement.querySelector(`.insert-container[data-type="${type}"]`);
            if (!container) {
                container = crearNuevoContainer(type, caseToKeep);
                caseToKeepElement.appendChild(container);
            }
        });
    }
}

function crearNuevoContainer(type, caseNumber, country) {
    const container = document.createElement('div');
    container.className = 'insert-container';
    container.setAttribute('data-type', type);

    container.innerHTML = `
<textarea id="${type}DataInput${country}${caseNumber}" 
          rows="1" 
          placeholder="Agregar datos de ${type} del caso ${caseNumber}..."></textarea>
<button onclick="addRow('${type}', '${country}', ${caseNumber})">Insertar</button>
`;

    return container;
}

function combineCaseData(caseToKeep, caseToMerge) {
    const caseToKeepContainer = document.querySelector(`.case-container[data-case="${caseToKeep}"]`);
    const caseToMergeContainer = document.querySelector(`.case-container[data-case="${caseToMerge}"]`);

    if (!caseToKeepContainer || !caseToMergeContainer) {
        return;
    }

    const keepBin = caseToKeepContainer.getAttribute('data-case-bin');
    const mergeBin = caseToMergeContainer.getAttribute('data-case-bin');

    if (keepBin !== mergeBin) {
        return;
    }

    const tableTypes = ['auth', 'pres', 'mambu'];

    tableTypes.forEach(tableType => {
        const targetTableId = `#table${tableType}${keepBin === '555505' ? 'Chile' : 'Peru'}${caseToKeep}`;
        const sourceTableId = `#table${tableType}${keepBin === '555505' ? 'Chile' : 'Peru'}${caseToMerge}`;

        const targetTable = document.querySelector(`#${targetTableId} tbody`);
        const sourceTable = document.querySelector(`#${sourceTableId} tbody`);

        if (targetTable && sourceTable) {
            const rowsToMerge = sourceTable.querySelectorAll('tr');
            rowsToMerge.forEach((row, index) => {
                const newRow = row.cloneNode(true);
                targetTable.appendChild(newRow);
            });
        }
    });
}

function removeCase(caseNum) {
    const caseContainer = document.querySelector(`.case-container[data-case="${caseNum}"]`);
    if (caseContainer) {
        caseContainer.remove();
    }
}

function loadMessageTemplates() {
    fetch('plantillas.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar las plantillas');
            }
            return response.json();
        })
        .then(data => {
            const selectors = document.querySelectorAll('select[id^="messageSelector"]');
            selectors.forEach(selector => {
                for (let key in data) {
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = data[key].descripcion;
                    selector.appendChild(option);
                }
            });
        })
        .catch(error => {
            const errorDiv = document.createElement('div');
            errorDiv.style.color = 'red';
            errorDiv.textContent = `Error al cargar las plantillas: ${error.message}`;
            document.body.appendChild(errorDiv);
        });
}

function updateMessage(country, caseNumber) {
    const selector = document.getElementById(`messageSelector${country}${caseNumber}`);
    const selectedMessageDiv = document.getElementById(`selectedMessage${country}${caseNumber}`);
    const selectedKey = selector.value;

    selectedMessageDiv.innerHTML = "";

    fetch('plantillas.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar las plantillas');
            }
            return response.json();
        })
        .then(data => {
            if (selectedKey && data[selectedKey]) {
                const messageTemplate = data[selectedKey].mensaje;

                const textarea = document.createElement('textarea');
                textarea.value = messageTemplate;
                textarea.rows = 4;
                textarea.style.width = '100%';
                textarea.style.marginTop = '10px';

                const saveButton = document.createElement('button');
                saveButton.textContent = 'Guardar Cambios';
                saveButton.style.marginTop = '10px';
                saveButton.style.marginLeft = '10px';
                saveButton.onclick = () => {
                    data[selectedKey].mensaje = textarea.value;
                    selectedMessageDiv.innerHTML = `<strong>Mensaje Editado:</strong> ${textarea.value}`;
                };

                selectedMessageDiv.innerHTML = '';
                selectedMessageDiv.appendChild(textarea);
                selectedMessageDiv.appendChild(saveButton);
            } else {
                selectedMessageDiv.innerHTML = "<strong>No hay mensaje seleccionado.</strong>";
            }
        })
        .catch(error => {
            selectedMessageDiv.innerHTML = `<strong>Error:</strong> ${error.message}`;
        });
}

function insertEvidenceData() {
    const evidenceInput = document.getElementById('evidenceInput').value;
    const rows = evidenceInput.split('\n');
    const evidenceTableBody = document.querySelector('#evidenceTable tbody');

    rows.forEach(row => {
        const columns = row.split('\t');
        if (columns.length > 1) {
            const newRow = evidenceTableBody.insertRow();

            columns.forEach(column => {
                const newCell = newRow.insertCell();

                newCell.textContent = (column === 'null' || column.trim() === '') ? 'N/A' : column;
            });
        }
    });

    document.getElementById('evidenceInput').value = '';
    
    // Opcional: Mostrar un mensaje de éxito
    const rowCount = rows.filter(row => row.trim().length > 0).length;
    if (rowCount > 0) {
        alert(`Se insertaron ${rowCount} fila(s) correctamente`);
    }
}

function generateReport() {
    const caseContainer = document.getElementById('caseContainer').innerHTML;
    const evidenceTable = document.getElementById('evidenceTable').outerHTML;

    function getHighestCaseNumber(content, country) {
        const regex = new RegExp(`Caso ${country} (\\d+)`, 'g');
        let highestNumber = 0;
        let match;
        while ((match = regex.exec(content)) !== null) {
            const number = parseInt(match[1]);
            if (number > highestNumber) {
                highestNumber = number;
            }
        }
        return highestNumber;
    }

    function countSpecificElements(content, value) {
        const regex = new RegExp(`<td>${value}<\\/td>`, 'g');
        return (content.match(regex) || []).length;
    }

    const highestChileCase = getHighestCaseNumber(caseContainer, 'Chile');
    const highestPeruCase = getHighestCaseNumber(caseContainer, 'Perú');

    const chileElements = countSpecificElements(evidenceTable, '152');
    const peruElements = countSpecificElements(evidenceTable, '604');

    const chileTotal = highestChileCase + chileElements;
    const peruTotal = highestPeruCase + peruElements;
    const totalCasos = chileTotal + peruTotal;

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}${month}${day}`;

    const reportContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Casos Detectados en Proceso de IPM - ${formattedDate}</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Roboto', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 1800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        h1, h2 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
            margin-top: 30px;
        }

        h1 {
            font-size: 2.5em;
            text-align: center;
        }

        h2 {
            font-size: 1.8em;
        }

        .table-responsive {
            overflow-x: auto;
            margin-bottom: 30px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            background-color: #fff;
        }

        th, td {
            border: 1px solid #e0e0e0;
            padding: 12px;
            text-align: left;
        }

        th {
            background-color: #3498db;
            color: white;
            font-weight: bold;
            text-transform: uppercase;
        }

        tr:nth-child(even) {
            background-color: #f8f8f8;
        }

        tr:hover {
            background-color: #e8f4f8;
            transition: background-color 0.3s ease;
        }

        .summary-table {
            width: 950px;
            margin: 20px auto;
            font-size: 0.9em;
            border: 2px solid #3498db;
        }

        .summary-table th {
            background-color: #2980b9;
        }

        .summary-table td:last-child {
            font-weight: bold;
            text-align: center;
        }

        /* Ocultar elementos de edición y títulos de inserción en el reporte */
        .mensaje-edit-btn, 
        .mensaje-edit-container, 
        #mensajeEdit,
        [id^="mensajeEdit"],
        [id^="editBtn"],
        button[onclick*="editarMensaje"],
        button[onclick*="guardarMensaje"],
        button[onclick*="cancelarEdicion"],
        button[onclick*="addRow"],
        .input-group,
        div[id^="mensajeEdit"],
        .insert-title,
        textarea[id*="DataInput"],
        button.editar,
        div:has(> .insert-title),
        div:has(> textarea[id*="DataInput"]) {
            display: none !important;
        }

        @media print {
            body {
                background-color: #fff;
            }

            .container {
                box-shadow: none;
            }

            h1, h2 {
                page-break-after: avoid;
            }

            table {
                page-break-inside: avoid;
            }
        }

        @media (max-width: 768px) {
            .summary-table {
                width: 100%;
                margin-bottom: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Reporte de Casos Detectados en Proceso de IPM - ${formattedDate}</h1>
        <table class="summary-table">
            <thead>
                <tr>
                    <th>País</th>
                    <th>Total de Casos</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Chile</td>
                    <td>${chileTotal}</td>
                </tr>
                <tr>
                    <td>Perú</td>
                    <td>${peruTotal}</td>
                </tr>
                <tr>
                    <td><strong>Total General</strong></td>
                    <td><strong>${totalCasos}</strong></td>
                </tr>
            </tbody>
        </table>

        <h2>Casos Procesados</h2>
        <div class="table-responsive">
            ${filterCaseContainer(caseContainer)}
        </div>
        <h2>Evidencia de anulaciones / confirmaciones manual</h2>
        <div class="table-responsive">
            ${evidenceTable}
        </div>
    </div>
</body>
</html>
`;

    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_de_Rechazos_y_Anulaciones-Confirmaciones_Manuales_${formattedDate}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function filterCaseContainer(content) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;

    const elementsToRemove = [
        '.case-checkbox',
        '.mensaje-edit-btn',
        '.mensaje-edit-container',
        '#mensajeEdit',
        '[id^="mensajeEdit"]',
        '[id^="editBtn"]',
        '.insert-title',
        '.input-group',
        'textarea[id*="DataInput"]',
        'button[onclick*="addRow"]',
        'button.editar'
    ];

    elementsToRemove.forEach(selector => {
        const elements = tempDiv.querySelectorAll(selector);
        elements.forEach(element => element.remove());
    });

    return tempDiv.innerHTML;
}

function guardarMensaje(tipo, index) {
    const mensajeTextArea = document.getElementById(`mensaje${tipo}${index}`);
    const displayDiv = document.getElementById(`mensajeDisplay${tipo}${index}`);
    const editDiv = document.getElementById(`mensajeEdit${tipo}${index}`);
    const editBtn = document.getElementById(`editBtn${tipo}${index}`);
    const mensaje = mensajeTextArea.value.trim();

    if (mensaje === '') {
        alert('Por favor, ingrese un mensaje válido.');
        return;
    }

    // Actualizar el mensaje mostrado
    displayDiv.textContent = mensaje;
    
    // Volver al modo de visualización
    displayDiv.style.display = 'block';
    editDiv.style.display = 'none';
    editBtn.style.display = 'inline-block';
}

function editarMensaje(tipo, index) {
    const displayDiv = document.getElementById(`mensajeDisplay${tipo}${index}`);
    const editDiv = document.getElementById(`mensajeEdit${tipo}${index}`);
    const editBtn = document.getElementById(`editBtn${tipo}${index}`);
    
    displayDiv.style.display = 'none';
    editDiv.style.display = 'block';
    editBtn.style.display = 'none';
}

function cancelarEdicion(tipo, index) {
    const displayDiv = document.getElementById(`mensajeDisplay${tipo}${index}`);
    const editDiv = document.getElementById(`mensajeEdit${tipo}${index}`);
    const editBtn = document.getElementById(`editBtn${tipo}${index}`);
    
    displayDiv.style.display = 'block';
    editDiv.style.display = 'none';
    editBtn.style.display = 'inline-block';
}
