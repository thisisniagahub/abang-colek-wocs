// ==================================================
// WOCS Top Navigation Bar
// ==================================================

const WOCS_TOPNAV = {
    tabs: [
        { id: 'inbox', label: 'Inbox', icon: '📥', count: 0 },
        { id: 'unread', label: 'Unread', icon: '🔴', count: 0 },
        { id: 'favorites', label: 'Favorites', icon: '⭐', count: 0 },
        { id: 'group', label: 'Group', icon: '👥', count: 0 },
        { id: 'contact', label: 'Contact', icon: '👤', count: 0 },
        { id: 'non-contact', label: 'Non Contact', icon: '❓', count: 0 },
        { id: 'snooze', label: 'Snooze', icon: '⏰', count: 0 },
        { id: 'follow-up', label: 'Follow Up', icon: '🔔', count: 0 }
    ],

    activeTab: 'inbox',

    init() {
        this.injectTopNav();
        this.attachEventListeners();
        this.updateCounts();
        console.log('[WOCS] TopNav initialized');
    },

    injectTopNav() {
        const existing = document.getElementById('wocs-topnav');
        if (existing) existing.remove();

        // Find WhatsApp header to inject after
        const waHeader = document.querySelector('header');
        if (!waHeader) {
            console.log('[WOCS] WhatsApp header not found, retrying...');
            setTimeout(() => this.injectTopNav(), 1000);
            return;
        }

        const topnav = document.createElement('div');
        topnav.id = 'wocs-topnav';
        topnav.className = 'wocs-topnav';

        topnav.innerHTML = `
      <div class="wocs-topnav-tabs">
        ${this.tabs.map(tab => `
          <button class="wocs-topnav-tab ${tab.id === this.activeTab ? 'active' : ''}" 
                  data-tab="${tab.id}">
            <span class="wocs-tab-icon">${tab.icon}</span>
            <span class="wocs-tab-label">${tab.label}</span>
            <span class="wocs-tab-count" data-count="${tab.id}" style="display: ${tab.count > 0 ? 'inline' : 'none'}">
              ${tab.count}
            </span>
          </button>
        `).join('')}
      </div>
      <div class="wocs-topnav-actions">
        <button class="wocs-settings-btn" title="Settings">
          <span>⚙️</span>
        </button>
        <button class="wocs-upgrade-btn">
          <span>🚀 Upgrade</span>
        </button>
      </div>
    `;

        // Insert at top of body
        document.body.insertBefore(topnav, document.body.firstChild);
    },

    attachEventListeners() {
        const topnav = document.getElementById('wocs-topnav');
        if (!topnav) return;

        topnav.querySelectorAll('.wocs-topnav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabId = e.currentTarget.dataset.tab;
                this.switchTab(tabId);
            });
        });
    },

    switchTab(tabId) {
        this.activeTab = tabId;

        // Update UI
        document.querySelectorAll('.wocs-topnav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });

        // Filter chats
        this.filterChats(tabId);
    },

    filterChats(tabId) {
        // Get all chat list items
        const chatList = document.querySelectorAll('[data-testid="cell-frame-container"]');

        chatList.forEach(chat => {
            const isGroup = chat.querySelector('[data-icon="default-group"]');
            const isUnread = chat.querySelector('[data-testid="unread-count"]');

            let show = true;

            switch (tabId) {
                case 'unread':
                    show = !!isUnread;
                    break;
                case 'group':
                    show = !!isGroup;
                    break;
                case 'contact':
                    show = !isGroup;
                    break;
                case 'inbox':
                default:
                    show = true;
            }

            chat.style.display = show ? '' : 'none';
        });
    },

    updateCounts() {
        const chatList = document.querySelectorAll('[data-testid="cell-frame-container"]');

        let counts = {
            inbox: chatList.length,
            unread: 0,
            group: 0,
            contact: 0
        };

        chatList.forEach(chat => {
            if (chat.querySelector('[data-testid="unread-count"]')) counts.unread++;
            if (chat.querySelector('[data-icon="default-group"]')) {
                counts.group++;
            } else {
                counts.contact++;
            }
        });

        // Update badges
        Object.keys(counts).forEach(key => {
            const badge = document.querySelector(`[data-count="${key}"]`);
            if (badge) {
                badge.textContent = counts[key];
                badge.style.display = counts[key] > 0 ? 'inline' : 'none';
            }
        });

        // Refresh counts periodically
        setTimeout(() => this.updateCounts(), 5000);
    }
};

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => WOCS_TOPNAV.init());
} else {
    WOCS_TOPNAV.init();
}
