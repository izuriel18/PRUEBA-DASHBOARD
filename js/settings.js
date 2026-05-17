// js/settings.js

function initSettings() {
    const view = document.getElementById('view-settings');
    const config = DataManager.getConfig();

    view.innerHTML = `
        <div class="card" style="max-width: 800px; margin: 0 auto; margin-bottom: var(--space-6);">
            <div class="card-header">
                <span class="card-title">Configuración del Sistema</span>
                <i data-lucide="settings" class="card-icon"></i>
            </div>
            
            <div style="margin-bottom: var(--space-5);">
                <h4 style="margin-bottom: var(--space-3);">Días sin accidentes</h4>
                <div style="display:flex; gap:var(--space-3); align-items:center;">
                    <input type="number" id="setting-days" class="form-control" style="width:120px; font-family:var(--font-mono); font-weight:700;" value="${config.daysWithoutAccidents}">
                    <button class="btn btn-primary" onclick="updateDays()">Actualizar</button>
                    <button class="btn btn-danger" onclick="resetDays()">Resetear a 0</button>
                </div>
            </div>

            <hr style="border:0; border-top:1px solid var(--color-border); margin: var(--space-5) 0;">

            <div class="analytics-grid">
                <div>
                    <h4 style="margin-bottom: var(--space-3);">Gestión de Áreas</h4>
                    <ul id="setting-areas-list" style="margin-bottom: var(--space-3); max-height:200px; overflow-y:auto; border:1px solid var(--color-border); border-radius:var(--radius-md); padding:var(--space-2); background:var(--color-background);">
                        ${config.areas.map(a => `<li style="padding:var(--space-2); border-bottom:1px solid var(--color-border); font-size:0.875rem;">${a}</li>`).join('')}
                    </ul>
                    <div style="display:flex; gap:var(--space-2);">
                        <input type="text" id="new-area" class="form-control" placeholder="Nueva área...">
                        <button class="btn btn-secondary" onclick="addArea()">Agregar</button>
                    </div>
                </div>

                <div>
                    <h4 style="margin-bottom: var(--space-3);">Gestión de Categorías</h4>
                    <ul id="setting-cats-list" style="margin-bottom: var(--space-3); max-height:200px; overflow-y:auto; border:1px solid var(--color-border); border-radius:var(--radius-md); padding:var(--space-2); background:var(--color-background);">
                        ${config.categories.map(c => `<li style="padding:var(--space-2); border-bottom:1px solid var(--color-border); font-size:0.875rem;">${c}</li>`).join('')}
                    </ul>
                    <div style="display:flex; gap:var(--space-2);">
                        <input type="text" id="new-category" class="form-control" placeholder="Nueva categoría...">
                        <button class="btn btn-secondary" onclick="addCategory()">Agregar</button>
                    </div>
                </div>
            </div>

            <hr style="border:0; border-top:1px solid var(--color-border); margin: var(--space-5) 0;">

            <div>
                <h4 style="margin-bottom: var(--space-3);">Gestión de Datos</h4>
                <div style="display:flex; gap:var(--space-3);">
                    <button class="btn btn-secondary" onclick="exportDataCSV()">
                        <i data-lucide="download"></i> Exportar a CSV
                    </button>
                    <button class="btn btn-danger" onclick="resetAllData()">
                        <i data-lucide="trash-2"></i> Borrar Todo (Reset)
                    </button>
                </div>
            </div>
        </div>
    `;

    lucide.createIcons();
}

function updateDays() {
    const days = parseInt(document.getElementById('setting-days').value) || 0;
    const config = DataManager.getConfig();
    config.daysWithoutAccidents = days;
    DataManager.saveConfig(config);
    alert('Días actualizados correctamente');
}

function resetDays() {
    if(confirm('¿Está seguro de resetear el contador de días sin accidentes?')) {
        document.getElementById('setting-days').value = 0;
        updateDays();
    }
}

function addArea() {
    const input = document.getElementById('new-area');
    const val = input.value.trim();
    if (val) {
        const config = DataManager.getConfig();
        if(!config.areas.includes(val)) {
            config.areas.push(val);
            DataManager.saveConfig(config);
            initSettings();
        }
    }
}

function addCategory() {
    const input = document.getElementById('new-category');
    const val = input.value.trim();
    if (val) {
        const config = DataManager.getConfig();
        if(!config.categories.includes(val)) {
            config.categories.push(val);
            DataManager.saveConfig(config);
            initSettings();
        }
    }
}

function exportDataCSV() {
    const reports = DataManager.getReports();
    if(reports.length === 0) {
        alert("No hay datos para exportar");
        return;
    }

    const headers = ["ID", "Fecha", "Tipo", "Area", "Categoria", "Riesgo", "Estado", "Reportador"];
    const rows = reports.map(r => [
        r.id,
        new Date(r.date).toLocaleString('es-ES'),
        r.type,
        r.area,
        r.category,
        r.risk,
        r.status,
        r.reporter
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n"
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "safety_reports_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function resetAllData() {
    if(confirm('🚨 PELIGRO: ¿Está completamente seguro de borrar TODOS los reportes y configuración? Esta acción no se puede deshacer.')) {
        localStorage.removeItem('safetyReports');
        localStorage.removeItem('safetyConfig');
        alert('Datos eliminados. El sistema se recargará con datos de demostración.');
        location.reload();
    }
}
