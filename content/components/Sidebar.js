// ==================================================
// WOCS Sidebar Component - Right sidebar with panel icons
// ==================================================

const WOCS_SIDEBAR = {
    panels: [
        { id: 'analytics', icon: '📊', label: 'Analytics', shortcut: 'A' },
        { id: 'broadcasts', icon: '📡', label: 'Broadcasts', shortcut: 'B' },
        { id: 'templates', icon: '📝', label: 'Templates', shortcut: 'T' },
        { id: 'audience', icon: '👥', label: 'Audience', shortcut: 'U' },
        { id: 'export', icon: '📤', label: 'Export', shortcut: 'E' },
        { id: 'tools', icon: '🔧', label: 'Tools', shortcut: 'O' },
        { id: 'integrations', icon: '🔗', label: 'Integrations', shortcut: 'I' },
        { id: 'settings', icon: '⚙️', label: 'Settings', shortcut: 'S' },
        { id: 'support', icon: '❓', label: 'Support', shortcut: 'H' }
    ],

    activePanel: null,

    init() {
        this.injectSidebar();
        this.attachEventListeners();
        console.log('[WOCS] Sidebar initialized');
    },

    injectSidebar() {
        // Remove existing sidebar if present
        const existing = document.getElementById('wocs-sidebar');
        if (existing) existing.remove();

        const sidebar = document.createElement('div');
        sidebar.id = 'wocs-sidebar';
        sidebar.className = 'wocs-sidebar';

        sidebar.innerHTML = `
      <div class="wocs-sidebar-icons">
        ${this.panels.map(panel => `
          <button class="wocs-sidebar-btn" data-panel="${panel.id}" title="${panel.label} (${panel.shortcut})">
            <span class="wocs-sidebar-icon">${panel.icon}</span>
          </button>
        `).join('')}
      </div>
      <div class="wocs-sidebar-footer">
        <button class="wocs-sidebar-btn wocs-upgrade" title="Upgrade">
          🚀
        </button>
      </div>
    `;

        document.body.appendChild(sidebar);
    },

    attachEventListeners() {
        const sidebar = document.getElementById('wocs-sidebar');
        if (!sidebar) return;

        sidebar.querySelectorAll('.wocs-sidebar-btn[data-panel]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const panelId = e.currentTarget.dataset.panel;
                this.togglePanel(panelId);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                const panel = this.panels.find(p => p.shortcut.toLowerCase() === e.key.toLowerCase());
                if (panel) {
                    e.preventDefault();
                    this.togglePanel(panel.id);
                }
            }
        });
    },

    togglePanel(panelId) {
        // Remove active state from all buttons
        document.querySelectorAll('.wocs-sidebar-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Close current panel if same
        if (this.activePanel === panelId) {
            WOCS_PANELS.close();
            this.activePanel = null;
            return;
        }

        // Open new panel
        this.activePanel = panelId;
        const btn = document.querySelector(`.wocs-sidebar-btn[data-panel="${panelId}"]`);
        if (btn) btn.classList.add('active');

        WOCS_PANELS.open(panelId);
    }
};

// ==================================================
// WOCS Panel Container - Holds all panel content
// ==================================================

const WOCS_PANELS = {
    container: null,

    init() {
        this.createContainer();
    },

    createContainer() {
        const existing = document.getElementById('wocs-panel-container');
        if (existing) existing.remove();

        const container = document.createElement('div');
        container.id = 'wocs-panel-container';
        container.className = 'wocs-panel-container';
        container.innerHTML = `
      <div class="wocs-panel-header">
        <h3 class="wocs-panel-title"></h3>
        <button class="wocs-panel-close">&times;</button>
      </div>
      <div class="wocs-panel-content"></div>
    `;

        document.body.appendChild(container);
        this.container = container;

        // Close button
        container.querySelector('.wocs-panel-close').addEventListener('click', () => {
            this.close();
            WOCS_SIDEBAR.activePanel = null;
            document.querySelectorAll('.wocs-sidebar-btn').forEach(btn => {
                btn.classList.remove('active');
            });
        });
    },

    open(panelId) {
        if (!this.container) this.createContainer();

        const panel = WOCS_SIDEBAR.panels.find(p => p.id === panelId);
        if (!panel) return;

        this.container.querySelector('.wocs-panel-title').textContent = panel.label;
        this.container.classList.add('open');

        // Load panel content
        this.loadContent(panelId);
    },

    close() {
        if (this.container) {
            this.container.classList.remove('open');
        }
    },

    loadContent(panelId) {
        const contentArea = this.container.querySelector('.wocs-panel-content');

        switch (panelId) {
            case 'analytics':
                contentArea.innerHTML = WOCS_ANALYTICS.render();
                WOCS_ANALYTICS.init();
                break;
            case 'templates':
                contentArea.innerHTML = WOCS_TEMPLATES.render();
                WOCS_TEMPLATES.init();
                break;
            case 'export':
                contentArea.innerHTML = WOCS_EXPORT.render();
                WOCS_EXPORT.init();
                break;
            case 'broadcasts':
                contentArea.innerHTML = WOCS_BROADCASTS.render();
                WOCS_BROADCASTS.init();
                break;
            case 'audience':
                contentArea.innerHTML = WOCS_AUDIENCE.render();
                WOCS_AUDIENCE.init();
                break;
            case 'tools':
                contentArea.innerHTML = WOCS_TOOLS.render();
                WOCS_TOOLS.init();
                break;
            case 'integrations':
                contentArea.innerHTML = WOCS_INTEGRATIONS.render();
                break;
            case 'settings':
                contentArea.innerHTML = WOCS_SETTINGS.render();
                WOCS_SETTINGS.init();
                break;
            case 'support':
                contentArea.innerHTML = WOCS_SUPPORT.render();
                break;
            default:
                contentArea.innerHTML = '<p>Coming soon...</p>';
        }
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        WOCS_SIDEBAR.init();
        WOCS_PANELS.init();
    });
} else {
    WOCS_SIDEBAR.init();
    WOCS_PANELS.init();
}
