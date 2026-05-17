// js/dashboard.js

let dashboardCharts = [];

function initDashboard() {
    const dashboardView = document.getElementById('view-dashboard');
    const stats = DataManager.getStats();
    
    // Render HTML structure
    dashboardView.innerHTML = `
        <div class="kpi-grid">
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Total Reportes</span>
                    <i data-lucide="file-bar-chart-2" class="card-icon"></i>
                </div>
                <div class="kpi-value">${stats.total}</div>
                <div class="kpi-trend neutral">Histórico global</div>
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
                <div class="kpi-trend neutral">Ratio histórico</div>
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
        </div>

        <div class="analytics-grid">
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Tendencia de Hallazgos (Últimos 6 meses)</span>
                </div>
                <div class="chart-container">
                    <canvas id="trendChart"></canvas>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Top 5 Áreas con más reportes</span>
                </div>
                <div class="chart-container">
                    <canvas id="areaChart"></canvas>
                </div>
            </div>
        </div>
    `;

    lucide.createIcons();
    renderDashboardCharts();
}

function renderDashboardCharts() {
    // Clear old charts
    dashboardCharts.forEach(c => c.destroy());
    dashboardCharts = [];

    const reports = DataManager.getReports();
    
    // Setup Colors based on theme
    const isDark = document.body.classList.contains('dark-theme');
    const gridColor = isDark ? '#334155' : '#E2E8F0';
    const textColor = isDark ? '#94A3B8' : '#64748B';
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#64748B';
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#EA580C';

    Chart.defaults.color = textColor;
    Chart.defaults.font.family = "'Fira Sans', sans-serif";

    // 1. Trend Chart Data (Last 6 months)
    const months = [];
    const counts = [];
    const now = new Date();
    for(let i=5; i>=0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(d.toLocaleString('es-ES', { month: 'short' }).toUpperCase());
        
        // Count reports for this month
        const count = reports.filter(r => {
            const rd = new Date(r.date);
            return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
        }).length;
        counts.push(count);
    }

    const ctxTrend = document.getElementById('trendChart');
    if (ctxTrend) {
        dashboardCharts.push(new Chart(ctxTrend, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Reportes',
                    data: counts,
                    borderColor: accentColor,
                    backgroundColor: accentColor + '20', // 20 hex opacity
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
    if (ctxArea) {
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
