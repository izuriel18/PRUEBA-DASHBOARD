// js/dashboard.js

let dashboardCharts = [];
let currentFilters = { dateRange: 'all', area: 'all', type: 'all' };

async function initDashboard() {
    const dashboardView = document.getElementById('view-dashboard');
    const config = DataManager.getConfig();
    const areasOptions = config.areas.map(a => `<option value="${a}" ${currentFilters.area === a ? 'selected' : ''}>${a}</option>`).join('');

    // Render HTML structure (Filter Bar + KPI Skeleton)
    dashboardView.innerHTML = `
        <div class="action-bar card" style="margin-bottom: var(--space-4); padding: var(--space-3) var(--space-4);">
            <div style="font-weight: 600; color: var(--color-muted-text); display:flex; align-items:center; gap:var(--space-2);">
                <i data-lucide="filter"></i> Filtros:
            </div>
            <div class="filter-group" style="flex:1; justify-content: flex-end; gap: var(--space-4);">
                <select id="dash-filter-date" class="form-control" style="width: auto;">
                    <option value="all" ${currentFilters.dateRange === 'all' ? 'selected' : ''}>Todo el Histórico</option>
                    <option value="7days" ${currentFilters.dateRange === '7days' ? 'selected' : ''}>Últimos 7 Días</option>
                    <option value="30days" ${currentFilters.dateRange === '30days' ? 'selected' : ''}>Últimos 30 Días</option>
                    <option value="1year" ${currentFilters.dateRange === '1year' ? 'selected' : ''}>Último Año</option>
                </select>
                <select id="dash-filter-area" class="form-control" style="width: auto;">
                    <option value="all" ${currentFilters.area === 'all' ? 'selected' : ''}>Todas las Áreas</option>
                    ${areasOptions}
                </select>
                <select id="dash-filter-type" class="form-control" style="width: auto;">
                    <option value="all" ${currentFilters.type === 'all' ? 'selected' : ''}>Todos los Tipos</option>
                    <option value="Acto Inseguro" ${currentFilters.type === 'Acto Inseguro' ? 'selected' : ''}>Actos Inseguros</option>
                    <option value="Condición Insegura" ${currentFilters.type === 'Condición Insegura' ? 'selected' : ''}>Condiciones Inseguras</option>
                </select>
            </div>
        </div>

        <div class="kpi-grid" id="kpi-container">
            <div style="padding: var(--space-5); text-align: center; color: var(--color-muted-text);">Cargando datos desde Supabase...</div>
        </div>

        <div class="analytics-grid">
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Tendencia de Hallazgos (Filtrada)</span>
                </div>
                <div class="chart-container">
                    <canvas id="trendChart"></canvas>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Top 5 Áreas (Filtrada)</span>
                </div>
                <div class="chart-container">
                    <canvas id="areaChart"></canvas>
                </div>
            </div>
        </div>
    `;

    // Bind Filter Events
    document.getElementById('dash-filter-date').addEventListener('change', async (e) => {
        currentFilters.dateRange = e.target.value;
        await updateDashboardView();
    });
    document.getElementById('dash-filter-area').addEventListener('change', async (e) => {
        currentFilters.area = e.target.value;
        await updateDashboardView();
    });
    document.getElementById('dash-filter-type').addEventListener('change', async (e) => {
        currentFilters.type = e.target.value;
        await updateDashboardView();
    });

    await updateDashboardView();
}

async function updateDashboardView() {
    const kpiContainer = document.getElementById('kpi-container');
    kpiContainer.innerHTML = '<div style="padding: var(--space-5); text-align: center; color: var(--color-muted-text);">Actualizando...</div>';
    
    const stats = await DataManager.getStats(currentFilters);

    kpiContainer.innerHTML = `
        <div class="card">
            <div class="card-header">
                <span class="card-title">Total Reportes</span>
                <i data-lucide="file-bar-chart-2" class="card-icon"></i>
            </div>
            <div class="kpi-value">${stats.total}</div>
            <div class="kpi-trend neutral">Según filtros aplicados</div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <span class="card-title">Tasa de Cierre</span>
                <i data-lucide="check-circle" class="card-icon"></i>
            </div>
            <div class="kpi-value ${stats.closeRate >= 80 ? 'safe' : (stats.closeRate > 50 ? 'warning' : 'danger')}">${stats.closeRate}%</div>
            <div class="kpi-trend ${stats.closeRate >= 80 ? 'positive' : 'negative'}">
                <i data-lucide="${stats.closeRate >= 80 ? 'trending-up' : 'trending-down'}"></i>
                Objetivo: 80%
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <span class="card-title">Actos vs Condiciones</span>
                <i data-lucide="scale" class="card-icon"></i>
            </div>
            <div class="kpi-value accent" style="font-size: clamp(1.5rem, 3vw, 2.5rem); padding-top:10px;">
                ${stats.actosCount} <span style="color:var(--color-muted-text);font-size:1rem;">/</span> ${stats.condicionesCount}
            </div>
            <div class="kpi-trend neutral">Ratio filtrado</div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <span class="card-title">Críticos Abiertos</span>
                <i data-lucide="alert-triangle" class="card-icon" style="color:var(--color-danger); background:rgba(220,38,38,0.1)"></i>
            </div>
            <div class="kpi-value ${stats.criticalOpen > 0 ? 'danger' : 'safe'}">${stats.criticalOpen}</div>
            <div class="kpi-trend ${stats.criticalOpen > 0 ? 'negative' : 'positive'}">
                Atención inmediata requerida
            </div>
        </div>
    `;

    lucide.createIcons();
    await renderDashboardCharts();
}

async function renderDashboardCharts() {
    // Clear old charts
    dashboardCharts.forEach(c => c.destroy());
    dashboardCharts = [];

    const reports = await DataManager.getFilteredReports(currentFilters);
    
    // Setup Colors based on theme
    const isDark = document.body.classList.contains('dark-theme');
    const gridColor = isDark ? '#334155' : '#E2E8F0';
    const textColor = isDark ? '#94A3B8' : '#64748B';
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#64748B';
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#EA580C';

    Chart.defaults.color = textColor;
    Chart.defaults.font.family = "'Fira Sans', sans-serif";

    // 1. Trend Chart Data
    // Group by month/year for the trend
    const trendData = {};
    reports.forEach(r => {
        const d = new Date(r.date);
        const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        trendData[key] = (trendData[key] || 0) + 1;
    });

    const sortedKeys = Object.keys(trendData).sort();
    // Get last 6 active months from data
    const last6Keys = sortedKeys.slice(-6);

    const labels = last6Keys.map(k => {
        const [y, m] = k.split('-');
        const d = new Date(y, parseInt(m) - 1, 1);
        return d.toLocaleString('es-ES', { month: 'short' }).toUpperCase() + ' ' + y.slice(2);
    });
    
    const counts = last6Keys.map(k => trendData[k]);

    const ctxTrend = document.getElementById('trendChart');
    if (ctxTrend && labels.length > 0) {
        dashboardCharts.push(new Chart(ctxTrend, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Reportes',
                    data: counts,
                    borderColor: accentColor,
                    backgroundColor: accentColor + '20',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: accentColor,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: textColor } },
                    y: { grid: { color: gridColor }, ticks: { color: textColor, stepSize: 5 } }
                }
            }
        }));
    }

    // 2. Area Chart Data
    const areaCounts = {};
    reports.forEach(r => {
        areaCounts[r.area] = (areaCounts[r.area] || 0) + 1;
    });
    
    // Sort and get top 5
    const sortedAreas = Object.entries(areaCounts).sort((a,b) => b[1] - a[1]).slice(0, 5);

    const ctxArea = document.getElementById('areaChart');
    if (ctxArea && sortedAreas.length > 0) {
        dashboardCharts.push(new Chart(ctxArea, {
            type: 'bar',
            data: {
                labels: sortedAreas.map(a => a[0]),
                datasets: [{
                    label: 'Reportes',
                    data: sortedAreas.map(a => a[1]),
                    backgroundColor: primaryColor,
                    borderRadius: 4
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: gridColor }, ticks: { color: textColor } },
                    y: { grid: { display: false }, ticks: { color: textColor } }
                }
            }
        }));
    }
}
