// js/analytics.js

let analyticsCharts = [];

async function initAnalytics() {
    const view = document.getElementById('view-analytics');
    
    view.innerHTML = `
        <div class="card" style="margin-bottom: var(--space-4);">
            <div class="card-header">
                <span class="card-title">Distribución de Tipos y Riesgos</span>
                <i data-lucide="pie-chart" class="card-icon"></i>
            </div>
            <div id="analytics-loading" style="padding: var(--space-5); text-align: center; color: var(--color-muted-text);">Cargando analíticas desde Supabase...</div>
            <div class="analytics-grid" id="analytics-content1" style="display:none;">
                <div class="chart-container">
                    <canvas id="typeChart"></canvas>
                </div>
                <div class="chart-container">
                    <canvas id="riskChart"></canvas>
                </div>
            </div>
        </div>

        <div class="card" id="analytics-content2" style="display:none;">
            <div class="card-header">
                <span class="card-title">Top Categorías de Hallazgos (Pareto)</span>
                <i data-lucide="bar-chart-horizontal" class="card-icon"></i>
            </div>
            <div class="chart-container large">
                <canvas id="categoryChart"></canvas>
            </div>
        </div>
    `;

    lucide.createIcons();
    await renderAnalyticsCharts();
}

async function renderAnalyticsCharts() {
    analyticsCharts.forEach(c => c.destroy());
    analyticsCharts = [];

    const reports = await DataManager.getReports();
    const loading = document.getElementById('analytics-loading');
    const content1 = document.getElementById('analytics-content1');
    const content2 = document.getElementById('analytics-content2');

    if(loading) loading.style.display = 'none';
    if(content1) content1.style.display = 'grid';
    if(content2) content2.style.display = 'block';
    if(reports.length === 0) return;

    const isDark = document.body.classList.contains('dark-theme');
    const gridColor = isDark ? '#334155' : '#E2E8F0';
    const textColor = isDark ? '#94A3B8' : '#64748B';
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#64748B';
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#EA580C';

    Chart.defaults.color = textColor;
    Chart.defaults.font.family = "'Fira Sans', sans-serif";

    // 1. Types Chart (Doughnut)
    const typeCounts = { 'Acto Inseguro': 0, 'Condición Insegura': 0 };
    reports.forEach(r => typeCounts[r.type]++);

    const ctxType = document.getElementById('typeChart');
    if(ctxType) {
        analyticsCharts.push(new Chart(ctxType, {
            type: 'doughnut',
            data: {
                labels: Object.keys(typeCounts),
                datasets: [{
                    data: Object.values(typeCounts),
                    backgroundColor: [primaryColor, accentColor],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { position: 'bottom', labels: { color: textColor, padding: 20 } }
                }
            }
        }));
    }

    // 2. Risk Chart (Polar Area or Bar)
    const riskCounts = { 'Bajo': 0, 'Medio': 0, 'Alto': 0, 'Crítico': 0 };
    reports.forEach(r => { if(riskCounts[r.risk] !== undefined) riskCounts[r.risk]++; });

    const ctxRisk = document.getElementById('riskChart');
    if(ctxRisk) {
        analyticsCharts.push(new Chart(ctxRisk, {
            type: 'bar',
            data: {
                labels: Object.keys(riskCounts),
                datasets: [{
                    label: 'Cantidad',
                    data: Object.values(riskCounts),
                    backgroundColor: ['#16A34A', '#D97706', '#EA580C', '#DC2626'],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: gridColor }, ticks: { color: textColor } },
                    x: { grid: { display: false }, ticks: { color: textColor } }
                }
            }
        }));
    }

    // 3. Category Pareto
    const catCounts = {};
    reports.forEach(r => catCounts[r.category] = (catCounts[r.category] || 0) + 1);
    
    const sortedCats = Object.entries(catCounts).sort((a,b) => b[1] - a[1]);
    
    const ctxCat = document.getElementById('categoryChart');
    if(ctxCat) {
        analyticsCharts.push(new Chart(ctxCat, {
            type: 'bar',
            data: {
                labels: sortedCats.map(c => c[0]),
                datasets: [{
                    label: 'Reportes',
                    data: sortedCats.map(c => c[1]),
                    backgroundColor: primaryColor,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: gridColor }, ticks: { color: textColor } },
                    x: { grid: { display: false }, ticks: { color: textColor, maxRotation: 45, minRotation: 45 } }
                }
            }
        }));
    }
}
