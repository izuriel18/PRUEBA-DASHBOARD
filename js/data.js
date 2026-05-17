// js/data.js

const SUPABASE_URL = 'https://isubqljvomusthcoolxi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzdWJxbGp2b211c3RoY29vbHhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMzMzMTIsImV4cCI6MjA5NDYwOTMxMn0.MyZisN0IQkLtDSabygQ-e874oBf_POZOpVUENL0oDdA';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const DataManager = {
    async getReports() {
        const { data, error } = await supabaseClient
            .from('reports')
            .select('*')
            .order('date', { ascending: false });
            
        if (error) {
            console.error('Error fetching reports:', error);
            return [];
        }
        return data;
    },

    async saveReport(report) {
        report.id = 'REP-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        report.date = new Date().toISOString();
        
        const { data, error } = await supabaseClient
            .from('reports')
            .insert([report])
            .select();
            
        if (error) {
            console.error('Error saving report:', error);
            return null;
        }
        return data[0];
    },

    async updateReportStatus(id, newStatus) {
        const { error } = await supabaseClient
            .from('reports')
            .update({ status: newStatus })
            .eq('id', id);
            
        if (error) {
            console.error('Error updating status:', error);
            return false;
        }
        return true;
    },

    getConfig() {
        // Keep config local for now as requested
        return JSON.parse(localStorage.getItem('safetyConfig') || '{"areas":[], "categories":[]}');
    },

    saveConfig(config) {
        localStorage.setItem('safetyConfig', JSON.stringify(config));
    },

    async getFilteredReports(filters = {}) {
        let query = supabaseClient.from('reports').select('*').order('date', { ascending: false });
        
        if (filters.area && filters.area !== 'all') {
            query = query.eq('area', filters.area);
        }
        if (filters.type && filters.type !== 'all') {
            query = query.eq('type', filters.type);
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
            
            query = query.gte('date', limitDate.toISOString());
        }
        
        const { data, error } = await query;
        if (error) {
            console.error('Error fetching filtered reports:', error);
            return [];
        }
        return data;
    },

    async getStats(filters = {}) {
        const reports = await this.getFilteredReports(filters);
        
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
    },
    
    async migrateLocalToSupabase() {
        // Only run this manually if you want to push your localStorage data to Supabase
        const localReports = JSON.parse(localStorage.getItem('safetyReports') || '[]');
        if(localReports.length > 0) {
            console.log(`Migrating ${localReports.length} reports to Supabase...`);
            const { error } = await supabaseClient.from('reports').insert(localReports);
            if(error) {
                console.error("Migration failed:", error);
            } else {
                console.log("Migration successful!");
                localStorage.removeItem('safetyReports'); // clear local after migration
            }
        }
    }
};
