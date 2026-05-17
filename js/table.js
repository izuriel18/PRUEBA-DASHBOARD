// js/table.js

let currentTableData = [];

function initTable() {
    const view = document.getElementById('view-table');
    
    view.innerHTML = `
        <div class="card">
            <div class="card-header">
                <span class="card-title">Listado de Hallazgos</span>
                <i data-lucide="list-todo" class="card-icon"></i>
            </div>
            
            <div class="action-bar">
                <div class="search-box">
                    <i data-lucide="search"></i>
                    <input type="text" id="table-search" class="form-control" placeholder="Buscar por ID, área, descripción...">
                </div>
                <div class="filter-group">
                    <select id="filter-status" class="form-control" style="width: 150px;">
                        <option value="all">Todos los estados</option>
                        <option value="Abierto">Abiertos</option>
                        <option value="En Proceso">En Proceso</option>
                        <option value="Cerrado">Cerrados</option>
                    </select>
                    <select id="filter-risk" class="form-control" style="width: 150px;">
                        <option value="all">Todos los riesgos</option>
                        <option value="Crítico">Crítico</option>
                        <option value="Alto">Alto</option>
                        <option value="Medio">Medio</option>
                        <option value="Bajo">Bajo</option>
                    </select>
                </div>
            </div>

            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Fecha</th>
                            <th>Área</th>
                            <th>Tipo</th>
                            <th>Riesgo</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="table-body">
                        <!-- Rows -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal Detalles -->
        <div id="detail-modal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modal-title">Detalle de Reporte</h3>
                    <button class="btn-icon" onclick="closeModal()"><i data-lucide="x"></i></button>
                </div>
                <div class="modal-body" id="modal-body">
                    <!-- Content -->
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal()">Cerrar</button>
                    <button class="btn btn-primary" id="btn-update-status">Actualizar Estado</button>
                </div>
            </div>
        </div>
    `;

    lucide.createIcons();

    // Event Listeners for Filters
    document.getElementById('table-search').addEventListener('input', renderTable);
    document.getElementById('filter-status').addEventListener('change', renderTable);
    document.getElementById('filter-risk').addEventListener('change', renderTable);

    renderTable();
}

function getRiskBadge(risk) {
    switch(risk) {
        case 'Crítico': return `<span class="badge badge-danger"><i data-lucide="alert-octagon"></i> Crítico</span>`;
        case 'Alto': return `<span class="badge badge-accent"><i data-lucide="alert-triangle"></i> Alto</span>`;
        case 'Medio': return `<span class="badge badge-warning"><i data-lucide="info"></i> Medio</span>`;
        case 'Bajo': return `<span class="badge badge-safe"><i data-lucide="check-circle-2"></i> Bajo</span>`;
        default: return `<span class="badge badge-neutral">${risk}</span>`;
    }
}

function getStatusBadge(status) {
    switch(status) {
        case 'Abierto': return `<span class="badge badge-danger"><i data-lucide="circle"></i> Abierto</span>`;
        case 'En Proceso': return `<span class="badge badge-warning"><i data-lucide="clock"></i> En Proceso</span>`;
        case 'Cerrado': return `<span class="badge badge-safe"><i data-lucide="check-circle"></i> Cerrado</span>`;
        default: return `<span class="badge badge-neutral">${status}</span>`;
    }
}

function renderTable() {
    const allReports = DataManager.getReports();
    const searchTerm = document.getElementById('table-search').value.toLowerCase();
    const statusFilter = document.getElementById('filter-status').value;
    const riskFilter = document.getElementById('filter-risk').value;

    currentTableData = allReports.filter(r => {
        const matchesSearch = r.id.toLowerCase().includes(searchTerm) || 
                              r.area.toLowerCase().includes(searchTerm) || 
                              r.description.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        const matchesRisk = riskFilter === 'all' || r.risk === riskFilter;
        
        return matchesSearch && matchesStatus && matchesRisk;
    });

    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';

    if (currentTableData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: var(--space-5); color: var(--color-muted-text);">No se encontraron registros.</td></tr>`;
        return;
    }

    currentTableData.slice(0, 50).forEach(r => {
        const date = new Date(r.date).toLocaleDateString('es-ES');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="mono-data">${r.id}</td>
            <td>${date}</td>
            <td><strong>${r.area}</strong><br><span style="font-size:0.75rem; color:var(--color-muted-text)">${r.category}</span></td>
            <td>${r.type}</td>
            <td>${getRiskBadge(r.risk)}</td>
            <td>${getStatusBadge(r.status)}</td>
            <td>
                <button class="btn btn-secondary btn-icon" onclick="viewDetails('${r.id}')" title="Ver Detalles">
                    <i data-lucide="eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    lucide.createIcons();
}

function viewDetails(id) {
    const report = currentTableData.find(r => r.id === id);
    if (!report) return;

    document.getElementById('modal-title').textContent = `Detalle: ${report.id}`;
    
    const date = new Date(report.date).toLocaleString('es-ES');
    
    document.getElementById('modal-body').innerHTML = `
        <div class="analytics-grid" style="margin-bottom: var(--space-4);">
            <div>
                <p style="color:var(--color-muted-text); font-size:0.75rem; text-transform:uppercase;">Fecha de Reporte</p>
                <p class="mono-data">${date}</p>
            </div>
            <div>
                <p style="color:var(--color-muted-text); font-size:0.75rem; text-transform:uppercase;">Reportado por</p>
                <p><strong>${report.reporter}</strong></p>
            </div>
            <div>
                <p style="color:var(--color-muted-text); font-size:0.75rem; text-transform:uppercase;">Área / Zona</p>
                <p>${report.area}</p>
            </div>
            <div>
                <p style="color:var(--color-muted-text); font-size:0.75rem; text-transform:uppercase;">Clasificación</p>
                <p>${report.type} - ${report.category}</p>
            </div>
        </div>
        
        <div style="margin-bottom: var(--space-4);">
            <p style="color:var(--color-muted-text); font-size:0.75rem; text-transform:uppercase;">Descripción</p>
            <div style="background:var(--color-background); padding:var(--space-3); border-radius:var(--radius-md); border:1px solid var(--color-border); margin-top:var(--space-1);">
                ${report.description}
            </div>
        </div>
        
        <div class="analytics-grid">
            <div>
                <p style="color:var(--color-muted-text); font-size:0.75rem; text-transform:uppercase; margin-bottom:var(--space-1);">Nivel de Riesgo</p>
                ${getRiskBadge(report.risk)}
            </div>
            <div>
                <p style="color:var(--color-muted-text); font-size:0.75rem; text-transform:uppercase; margin-bottom:var(--space-1);">Estado Actual</p>
                ${getStatusBadge(report.status)}
            </div>
        </div>
        
        <div style="margin-top: var(--space-4);">
            <label class="form-label">Cambiar Estado:</label>
            <select id="modal-status-select" class="form-control">
                <option value="Abierto" ${report.status === 'Abierto' ? 'selected' : ''}>Abierto</option>
                <option value="En Proceso" ${report.status === 'En Proceso' ? 'selected' : ''}>En Proceso</option>
                <option value="Cerrado" ${report.status === 'Cerrado' ? 'selected' : ''}>Cerrado</option>
            </select>
        </div>
    `;

    document.getElementById('btn-update-status').onclick = () => {
        const newStatus = document.getElementById('modal-status-select').value;
        if (newStatus !== report.status) {
            DataManager.updateReportStatus(report.id, newStatus);
            renderTable();
            if(document.getElementById('view-dashboard').classList.contains('active') && typeof renderDashboardCharts === 'function') {
                renderDashboardCharts();
            }
        }
        closeModal();
    };

    lucide.createIcons();
    document.getElementById('detail-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('detail-modal').classList.remove('active');
}
