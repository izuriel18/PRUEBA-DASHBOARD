// js/demo-data.js

const AREAS = [
    "Producción L1", "Producción L2", "Almacén Principal", 
    "Patio de Maniobras", "Mantenimiento", "Oficinas Administrativas",
    "Cuarto de Máquinas", "Embarques"
];

const CATEGORIES = [
    "EPP Faltante/Inadecuado", "Orden y Limpieza", "Herramientas Defectuosas",
    "Uso de Celular", "Trabajo en Alturas", "Bloqueo y Etiquetado (LOTO)",
    "Riesgo Eléctrico", "Manejo de Montacargas", "Derrame de Químicos",
    "Pasillos Obstruidos"
];

const RISKS = ["Bajo", "Medio", "Alto", "Crítico"];
const STATUSES = ["Abierto", "En Proceso", "Cerrado"];
const TYPES = ["Acto Inseguro", "Condición Insegura"];

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateDemoData(count = 100) {
    const data = [];
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    for (let i = 0; i < count; i++) {
        const date = randomDate(oneYearAgo, now);
        const isClosed = Math.random() > 0.3; // 70% closed
        const status = isClosed ? "Cerrado" : (Math.random() > 0.5 ? "En Proceso" : "Abierto");
        
        data.push({
            id: 'REP-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
            date: date.toISOString(),
            type: TYPES[Math.floor(Math.random() * TYPES.length)],
            area: AREAS[Math.floor(Math.random() * AREAS.length)],
            category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
            risk: RISKS[Math.floor(Math.random() * RISKS.length)],
            description: `Reporte de hallazgo de seguridad en el área seleccionada durante el turno. Es necesario tomar acciones inmediatas para mitigar el riesgo.`,
            reporter: `Operador ${Math.floor(Math.random() * 50) + 1}`,
            status: status,
            resolution: status === "Cerrado" ? "Se corrigió la desviación inmediatamente." : ""
        });
    }

    // Sort by date descending
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    return data;
}

function initializeDemoData() {
    if (!localStorage.getItem('safetyReports')) {
        const demoRecords = generateDemoData(125);
        localStorage.setItem('safetyReports', JSON.stringify(demoRecords));
        localStorage.setItem('safetyConfig', JSON.stringify({
            areas: AREAS,
            categories: CATEGORIES,
            daysWithoutAccidents: Math.floor(Math.random() * 300) + 10
        }));
        console.log("Demo data initialized successfully.");
    }
}
