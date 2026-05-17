// js/reports.js

function initReports() {
    const view = document.getElementById('view-reports');
    const config = DataManager.getConfig();
    
    let areasOptions = config.areas.map(a => `<option value="${a}">${a}</option>`).join('');
    let categoriesOptions = config.categories.map(c => `<option value="${c}">${c}</option>`).join('');

    view.innerHTML = `
        <div class="card" style="max-width: 800px; margin: 0 auto;">
            <div class="card-header">
                <span class="card-title">Registrar Nuevo Hallazgo</span>
                <i data-lucide="clipboard-plus" class="card-icon"></i>
            </div>
            <form id="report-form">
                <div class="analytics-grid" style="margin-bottom: var(--space-4);">
                    <div class="form-group">
                        <label class="form-label">Tipo de Hallazgo</label>
                        <select id="report-type" class="form-control" required>
                            <option value="">Seleccione...</option>
                            <option value="Acto Inseguro">Acto Inseguro</option>
                            <option value="Condición Insegura">Condición Insegura</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Nivel de Riesgo</label>
                        <select id="report-risk" class="form-control" required>
                            <option value="">Seleccione...</option>
                            <option value="Bajo">Bajo</option>
                            <option value="Medio">Medio</option>
                            <option value="Alto">Alto</option>
                            <option value="Crítico">Crítico</option>
                        </select>
                    </div>
                </div>

                <div class="analytics-grid" style="margin-bottom: var(--space-4);">
                    <div class="form-group">
                        <label class="form-label">Área / Zona</label>
                        <select id="report-area" class="form-control" required>
                            <option value="">Seleccione...</option>
                            ${areasOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Categoría</label>
                        <select id="report-category" class="form-control" required>
                            <option value="">Seleccione...</option>
                            ${categoriesOptions}
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Descripción del Hallazgo</label>
                    <textarea id="report-description" class="form-control" placeholder="Describa a detalle lo observado..." required></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">Reportado por</label>
                    <input type="text" id="report-reporter" class="form-control" placeholder="Nombre o ID del trabajador" required>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-5);">
                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('report-form').reset()">Limpiar</button>
                    <button type="submit" class="btn btn-primary">Guardar Reporte</button>
                </div>
            </form>
            
            <div id="toast-success" style="display:none; background-color: var(--color-safe); color: white; padding: var(--space-3); border-radius: var(--radius-md); margin-top: var(--space-4); text-align: center; font-weight: 600;">
                <i data-lucide="check-circle"></i> Reporte guardado exitosamente.
            </div>
        </div>
    `;

    lucide.createIcons();

    document.getElementById('report-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btnSubmit = e.target.querySelector('button[type="submit"]');
        const originalText = btnSubmit.innerHTML;
        btnSubmit.innerHTML = "Guardando...";
        btnSubmit.disabled = true;

        const report = {
            type: document.getElementById('report-type').value,
            risk: document.getElementById('report-risk').value,
            area: document.getElementById('report-area').value,
            category: document.getElementById('report-category').value,
            description: document.getElementById('report-description').value,
            reporter: document.getElementById('report-reporter').value,
            status: 'Abierto',
            resolution: ''
        };

        const result = await DataManager.saveReport(report);
        
        btnSubmit.innerHTML = originalText;
        btnSubmit.disabled = false;

        if(result) {
            e.target.reset();
            const toast = document.getElementById('toast-success');
            toast.style.display = 'block';
            lucide.createIcons();
            
            setTimeout(() => {
                toast.style.display = 'none';
            }, 3000);
        } else {
            alert("Error guardando en Supabase. Revisa la consola.");
        }
    });
}
