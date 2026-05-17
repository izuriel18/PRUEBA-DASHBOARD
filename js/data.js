// js/data.js

const DataManager = {
    getReports() {
        return JSON.parse(localStorage.getItem('safetyReports') || '[]');
    },

    saveReport(report) {
        const reports = this.getReports();
        report.id = 'REP-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        report.date = new Date().toISOString();
        reports.unshift(report); // Add to beginning
        localStorage.setItem('safetyReports', JSON.stringify(reports));
        return report;
    },

    updateReportStatus(id, newStatus) {
        const reports = this.getReports();
        const index = reports.findIndex(r => r.id === id);
        if (index !== -1) {
            reports[index].status = newStatus;
            localStorage.setItem('safetyReports', JSON.stringify(reports));
            return true;
        }
        return false;
    },

    getConfig() {
        return JSON.parse(localStorage.getItem('safetyConfig') || '{"areas":[], "categories":[]}');
    },

    saveConfig(config) {
        localStorage.setItem('safetyConfig', JSON.stringify(config));
    },

    // Statistics helpers
    getStats() {
        const reports = this.getReports();
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyReports = reports.filter(r => {
            const d = new Date(r.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const openReports = reports.filter(r => r.status !== 'Cerrado');
        const closedReports = reports.filter(r => r.status === 'Cerrado');
        
        const actos = reports.filter(r => r.type === 'Acto Inseguro');
        const condiciones = reports.filter(r => r.type === 'Condición Insegura');
        
        const criticalReports = reports.filter(r => r.risk === 'Crítico' && r.status !== 'Cerrado');

        return {
            total: reports.length,
            monthlyTotal: monthlyReports.length,
            openCount: openReports.length,
            closeRate: reports.length ? Math.round((closedReports.length / reports.length) * 100) : 0,
            actosCount: actos.length,
            condicionesCount: condiciones.length,
            criticalOpen: criticalReports.length
        };
    }
};
