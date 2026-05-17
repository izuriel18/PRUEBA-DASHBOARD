// js/app.js

document.addEventListener('DOMContentLoaded', () => {
    // Initialize data if not present
    if (typeof initializeDemoData === 'function') {
        initializeDemoData();
    }

    // Initialize Lucide icons
    lucide.createIcons();

    // Setup Sidebar Toggle
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });

    // Setup Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check local storage for theme
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        themeToggle.querySelector('i').setAttribute('data-lucide', 'sun');
    }

    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('light-theme')) {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
            themeToggle.querySelector('i').setAttribute('data-lucide', 'sun');
            themeToggle.querySelector('span').textContent = 'Modo Claro';
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
            themeToggle.querySelector('i').setAttribute('data-lucide', 'moon');
            themeToggle.querySelector('span').textContent = 'Modo Oscuro';
        }
        lucide.createIcons();
        
        // Re-render charts for theme change if defined
        if (typeof renderDashboardCharts === 'function') {
            setTimeout(renderDashboardCharts, 300);
        }
        if (typeof renderAnalyticsCharts === 'function' && document.getElementById('view-analytics').classList.contains('active')) {
            setTimeout(renderAnalyticsCharts, 300);
        }
    });

    // Setup Navigation (SPA Routing)
    const navItems = document.querySelectorAll('.nav-links .nav-item');
    const views = document.querySelectorAll('.view');
    const viewTitle = document.getElementById('current-view-title');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active from all
            navItems.forEach(nav => nav.classList.remove('active'));
            views.forEach(view => view.classList.remove('active'));

            // Add active to clicked
            item.classList.add('active');
            const targetViewId = item.getAttribute('data-view');
            document.getElementById(`view-${targetViewId}`).classList.add('active');
            viewTitle.textContent = item.querySelector('span').textContent;

            // Trigger specific view initialization
            if (targetViewId === 'dashboard' && typeof initDashboard === 'function') {
                initDashboard();
            } else if (targetViewId === 'table' && typeof initTable === 'function') {
                initTable();
            } else if (targetViewId === 'analytics' && typeof initAnalytics === 'function') {
                initAnalytics();
            } else if (targetViewId === 'reports' && typeof initReports === 'function') {
                initReports();
            } else if (targetViewId === 'settings' && typeof initSettings === 'function') {
                initSettings();
            }
        });
    });

    // Initial render
    if (typeof initDashboard === 'function') {
        initDashboard();
    }
});
