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
    getFilteredReports(filters = {}) {
        let reports = this.getReports();
        
        if (filters.area && filters.area !== 'all') {
            reports = reports.filter(r => r.area === filters.area);
        }
        
        if (filters.type && filters.type !== 'all') {
            reports = reports.filter(r => r.type === filters.type);
        }
        
        if (filters.dateRange && filters.dateRange !== 'all') {
            const now = new Date();
            let limitDate = new Date();
            
            if (filters.dateRange === '7days') {
                limitDate.setDate(now.getDate() - 7);
            } else if (filters.dateRange === '30days') {
                limitDate.setDate(now.getDate() - 30);
            } else if (filters.dateRange === '1year') {
                limitDate.setFullYear(now.getFullYear() - 1);
            }
            
            reports = reports.filter(r => new Date(r.date) >= limitDate);
        }
        
        return reports;
    },

    getStats(filters = {}) {
        const reports = this.getFilteredReports(filters);
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
