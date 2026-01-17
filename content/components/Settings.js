// ==================================================
// WOCS Settings Panel (Privacy & Preferences)
// ==================================================

const WOCS_SETTINGS = {
    settings: {
        privacy: {
            blurContactNames: false,
            blurContactPhotos: false,
            blurRecentMessages: false,
            blurConversationMessages: false
        },
        smartInbox: {
            enabled: false,
            listView: false,
            autoAssign: false
        },
        powerButtons: {
            saveContact: true,
            startNewChat: true,
            copyMessage: true,
            archiveChat: true,
            quickReply: true
        },
        addOns: {
            scheduleMessages: false,
            quickWorkflow: false,
            contactCard: false,
            inviteToText: false
        }
    },

    render() {
        return `
      <div class="wocs-settings">
        <!-- Privacy Section -->
        <div class="wocs-settings-section">
          <h3>🔒 Privacy</h3>
          <div class="wocs-settings-grid">
            <label class="wocs-setting-item">
              <input type="checkbox" id="wocs-blur-names" ${this.settings.privacy.blurContactNames ? 'checked' : ''}>
              <span>Blur Contact Names</span>
            </label>
            <label class="wocs-setting-item">
              <input type="checkbox" id="wocs-blur-photos" ${this.settings.privacy.blurContactPhotos ? 'checked' : ''}>
              <span>Blur Contact Photos</span>
            </label>
            <label class="wocs-setting-item">
              <input type="checkbox" id="wocs-blur-recent" ${this.settings.privacy.blurRecentMessages ? 'checked' : ''}>
              <span>Blur Recent Messages</span>
            </label>
            <label class="wocs-setting-item">
              <input type="checkbox" id="wocs-blur-conversation" ${this.settings.privacy.blurConversationMessages ? 'checked' : ''}>
              <span>Blur Conversation Messages</span>
            </label>
          </div>
        </div>
        
        <!-- Power Buttons Section -->
        <div class="wocs-settings-section">
          <h3>⚡ Power Buttons</h3>
          <div class="wocs-settings-grid">
            <label class="wocs-setting-item">
              <input type="checkbox" id="wocs-btn-save" ${this.settings.powerButtons.saveContact ? 'checked' : ''}>
              <span>Save Contact</span>
            </label>
            <label class="wocs-setting-item">
              <input type="checkbox" id="wocs-btn-newchat" ${this.settings.powerButtons.startNewChat ? 'checked' : ''}>
              <span>Start a New Chat</span>
            </label>
            <label class="wocs-setting-item">
              <input type="checkbox" id="wocs-btn-copy" ${this.settings.powerButtons.copyMessage ? 'checked' : ''}>
              <span>Copy Message</span>
            </label>
            <label class="wocs-setting-item">
              <input type="checkbox" id="wocs-btn-archive" ${this.settings.powerButtons.archiveChat ? 'checked' : ''}>
              <span>Archive Chat</span>
            </label>
            <label class="wocs-setting-item">
              <input type="checkbox" id="wocs-btn-quickreply" ${this.settings.powerButtons.quickReply ? 'checked' : ''}>
              <span>Quick Reply Templates</span>
            </label>
          </div>
        </div>
        
        <!-- Smart Inbox Section -->
        <div class="wocs-settings-section">
          <h3>📬 Smart Inbox</h3>
          <div class="wocs-settings-grid">
            <label class="wocs-setting-item">
              <input type="checkbox" id="wocs-smart-listview" ${this.settings.smartInbox.listView ? 'checked' : ''}>
              <span>Smart Inbox List View</span>
            </label>
            <label class="wocs-setting-item">
              <input type="checkbox" id="wocs-smart-autoassign" ${this.settings.smartInbox.autoAssign ? 'checked' : ''}>
              <span>Auto Assign</span>
            </label>
          </div>
        </div>
        
        <!-- Add-Ons Section -->
        <div class="wocs-settings-section">
          <h3>🔌 Add-Ons</h3>
          <div class="wocs-settings-grid">
            <label class="wocs-setting-item">
              <input type="checkbox" id="wocs-addon-schedule" ${this.settings.addOns.scheduleMessages ? 'checked' : ''}>
              <span>Schedule Messages</span>
              <span class="wocs-badge premium">Premium</span>
            </label>
            <label class="wocs-setting-item">
              <input type="checkbox" id="wocs-addon-workflow" ${this.settings.addOns.quickWorkflow ? 'checked' : ''}>
              <span>Quick Workflow</span>
              <span class="wocs-badge premium">Premium</span>
            </label>
            <label class="wocs-setting-item">
              <input type="checkbox" id="wocs-addon-contactcard" ${this.settings.addOns.contactCard ? 'checked' : ''}>
              <span>Contact Card</span>
            </label>
            <label class="wocs-setting-item">
              <input type="checkbox" id="wocs-addon-invite" ${this.settings.addOns.inviteToText ? 'checked' : ''}>
              <span>Invite to Text</span>
            </label>
          </div>
        </div>
        
        <!-- Save Button -->
        <div class="wocs-settings-actions">
          <button class="wocs-btn" id="wocs-reset-settings">Reset to Default</button>
          <button class="wocs-btn wocs-btn-primary" id="wocs-save-settings">Save Settings</button>
        </div>
      </div>
    `;
    },

    init() {
        this.loadSettings();
        this.attachEventListeners();
    },

    attachEventListeners() {
        // Save settings
        document.getElementById('wocs-save-settings')?.addEventListener('click', () => {
            this.saveSettings();
        });

        // Reset settings
        document.getElementById('wocs-reset-settings')?.addEventListener('click', () => {
            if (confirm('Reset all settings to default?')) {
                this.resetSettings();
            }
        });

        // Privacy blur toggles - apply immediately
        ['wocs-blur-names', 'wocs-blur-photos', 'wocs-blur-recent', 'wocs-blur-conversation'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', (e) => {
                this.applyPrivacy(id, e.target.checked);
            });
        });
    },

    loadSettings() {
        chrome.storage.local.get(['wocsSettings'], (result) => {
            if (result.wocsSettings) {
                this.settings = { ...this.settings, ...result.wocsSettings };
                this.applyAllSettings();
            }
        });
    },

    saveSettings() {
        // Gather all settings from UI
        this.settings.privacy.blurContactNames = document.getElementById('wocs-blur-names')?.checked || false;
        this.settings.privacy.blurContactPhotos = document.getElementById('wocs-blur-photos')?.checked || false;
        this.settings.privacy.blurRecentMessages = document.getElementById('wocs-blur-recent')?.checked || false;
        this.settings.privacy.blurConversationMessages = document.getElementById('wocs-blur-conversation')?.checked || false;

        this.settings.powerButtons.saveContact = document.getElementById('wocs-btn-save')?.checked || false;
        this.settings.powerButtons.startNewChat = document.getElementById('wocs-btn-newchat')?.checked || false;
        this.settings.powerButtons.copyMessage = document.getElementById('wocs-btn-copy')?.checked || false;
        this.settings.powerButtons.archiveChat = document.getElementById('wocs-btn-archive')?.checked || false;
        this.settings.powerButtons.quickReply = document.getElementById('wocs-btn-quickreply')?.checked || false;

        this.settings.smartInbox.listView = document.getElementById('wocs-smart-listview')?.checked || false;
        this.settings.smartInbox.autoAssign = document.getElementById('wocs-smart-autoassign')?.checked || false;

        chrome.storage.local.set({ wocsSettings: this.settings });
        this.showNotification('Settings saved!');
        this.applyAllSettings();
    },

    resetSettings() {
        this.settings = {
            privacy: {
                blurContactNames: false,
                blurContactPhotos: false,
                blurRecentMessages: false,
                blurConversationMessages: false
            },
            smartInbox: { enabled: false, listView: false, autoAssign: false },
            powerButtons: {
                saveContact: true, startNewChat: true, copyMessage: true, archiveChat: true, quickReply: true
            },
            addOns: {
                scheduleMessages: false, quickWorkflow: false, contactCard: false, inviteToText: false
            }
        };

        chrome.storage.local.set({ wocsSettings: this.settings });
        this.applyAllSettings();

        // Refresh panel
        const content = document.querySelector('.wocs-panel-content');
        if (content) content.innerHTML = this.render();
        this.init();
    },

    applyPrivacy(settingId, enabled) {
        const body = document.body;

        switch (settingId) {
            case 'wocs-blur-names':
                body.classList.toggle('wocs-blur-names', enabled);
                break;
            case 'wocs-blur-photos':
                body.classList.toggle('wocs-blur-photos', enabled);
                break;
            case 'wocs-blur-recent':
                body.classList.toggle('wocs-blur-recent', enabled);
                break;
            case 'wocs-blur-conversation':
                body.classList.toggle('wocs-blur-conversation', enabled);
                break;
        }
    },

    applyAllSettings() {
        document.body.classList.toggle('wocs-blur-names', this.settings.privacy.blurContactNames);
        document.body.classList.toggle('wocs-blur-photos', this.settings.privacy.blurContactPhotos);
        document.body.classList.toggle('wocs-blur-recent', this.settings.privacy.blurRecentMessages);
        document.body.classList.toggle('wocs-blur-conversation', this.settings.privacy.blurConversationMessages);
    },

    showNotification(message) {
        const notif = document.createElement('div');
        notif.className = 'wocs-notification';
        notif.textContent = message;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    }
};
