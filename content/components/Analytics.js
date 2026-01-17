// ==================================================
// WOCS Analytics Panel
// ==================================================

const WOCS_ANALYTICS = {
    stats: {
        totalBroadcast: 0,
        workflowExecutions: 0,
        totalTemplates: 0,
        totalWhatsappChats: 0,
        totalSavedChats: 0,
        totalUnsavedChats: 0,
        totalGroups: 0,
        messages: 0,
        media: 0,
        attachments: 0,
        polls: 0,
        audio: 0,
        contactCards: 0
    },

    render() {
        return `
      <div class="wocs-analytics">
        <!-- Stats Cards Row -->
        <div class="wocs-stats-row">
          <div class="wocs-stat-card highlight">
            <h4>Total Broadcast</h4>
            <div class="wocs-stat-value">${this.stats.totalBroadcast}</div>
            <div class="wocs-stat-details">
              <span class="pending">• Pending: 0</span>
              <span class="success">• Success: 0</span>
              <span class="failed">• Failed: 0</span>
              <span class="time">• Time: 0s</span>
            </div>
          </div>
          
          <div class="wocs-stat-card">
            <h4>Workflow Executions</h4>
            <div class="wocs-stat-value">${this.stats.workflowExecutions}</div>
            <div class="wocs-stat-details">
              <span>• Total Workflows: 0</span>
              <span>• Template Workflows: 0</span>
              <span>• AI Workflows: 0</span>
            </div>
          </div>
          
          <div class="wocs-stat-card">
            <h4>Total Templates</h4>
            <div class="wocs-stat-value">${this.stats.totalTemplates}/2</div>
            <button class="wocs-btn wocs-btn-primary">Upgrade</button>
          </div>
          
          <div class="wocs-stat-card statistics">
            <h4>Statistics</h4>
            <div class="wocs-stat-list">
              <span>• Message: ${this.stats.messages}</span>
              <span>• Media: ${this.stats.media}</span>
              <span>• Attachments: ${this.stats.attachments}</span>
              <span>• Polls: ${this.stats.polls}</span>
              <span>• Audio: ${this.stats.audio}</span>
              <span>• Contact Card: ${this.stats.contactCards}</span>
            </div>
            <div class="wocs-no-data">No data available</div>
          </div>
        </div>
        
        <!-- Second Row -->
        <div class="wocs-stats-row">
          <div class="wocs-stat-card">
            <h4>Total Audience</h4>
            <div class="wocs-stat-value">0/0</div>
            <button class="wocs-btn wocs-btn-primary">Upgrade</button>
          </div>
          
          <div class="wocs-stat-card">
            <h4>Total WhatsApp Chats</h4>
            <div class="wocs-stat-value">${this.stats.totalWhatsappChats}</div>
          </div>
          
          <div class="wocs-stat-card">
            <h4>Total Saved Chats</h4>
            <div class="wocs-stat-value">${this.stats.totalSavedChats}</div>
          </div>
        </div>
        
        <!-- Third Row -->
        <div class="wocs-stats-row">
          <div class="wocs-stat-card">
            <h4>Total Unsaved Chats</h4>
            <div class="wocs-stat-value">${this.stats.totalUnsavedChats}</div>
          </div>
          
          <div class="wocs-stat-card">
            <h4>Total Groups</h4>
            <div class="wocs-stat-value">${this.stats.totalGroups}</div>
          </div>
        </div>
        
        <!-- Last Updated -->
        <div class="wocs-last-updated">
          Last Updated: <span id="wocs-last-update-time">${new Date().toLocaleString()}</span>
          <button class="wocs-refresh-btn" id="wocs-refresh-analytics">🔄</button>
        </div>
      </div>
    `;
    },

    init() {
        this.collectStats();
        this.attachEventListeners();
    },

    attachEventListeners() {
        const refreshBtn = document.getElementById('wocs-refresh-analytics');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.collectStats();
                this.updateUI();
            });
        }
    },

    collectStats() {
        // Count chats
        const chatList = document.querySelectorAll('[data-testid="cell-frame-container"]');
        let totalChats = 0;
        let groups = 0;
        let saved = 0;

        chatList.forEach(chat => {
            totalChats++;
            if (chat.querySelector('[data-icon="default-group"]')) {
                groups++;
            }
            // Check if contact is saved (has name vs just number)
            const nameEl = chat.querySelector('[data-testid="cell-frame-title"]');
            if (nameEl) {
                const name = nameEl.textContent;
                if (!/^\+?\d[\d\s-]+$/.test(name)) {
                    saved++;
                }
            }
        });

        this.stats.totalWhatsappChats = totalChats;
        this.stats.totalGroups = groups;
        this.stats.totalSavedChats = saved;
        this.stats.totalUnsavedChats = totalChats - saved - groups;

        // Load from storage
        chrome.storage.local.get(['wocsStats'], (result) => {
            if (result.wocsStats) {
                Object.assign(this.stats, result.wocsStats);
            }
            this.updateUI();
        });
    },

    updateUI() {
        // Update stat values in DOM
        const container = document.querySelector('.wocs-analytics');
        if (!container) return;

        // Update last updated time
        const timeEl = document.getElementById('wocs-last-update-time');
        if (timeEl) {
            timeEl.textContent = new Date().toLocaleString();
        }
    },

    incrementStat(statName, amount = 1) {
        if (this.stats.hasOwnProperty(statName)) {
            this.stats[statName] += amount;
            this.saveStats();
        }
    },

    saveStats() {
        chrome.storage.local.set({ wocsStats: this.stats });
    }
};
