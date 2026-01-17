// ==================================================
// WOCS Broadcasts Panel
// ==================================================

const WOCS_BROADCASTS = {
    broadcasts: [],

    render() {
        return `
      <div class="wocs-broadcasts">
        <!-- Header -->
        <div class="wocs-broadcasts-header">
          <button class="wocs-btn wocs-btn-primary" id="wocs-new-broadcast">
            + New Broadcast
          </button>
        </div>
        
        <!-- Broadcast Form -->
        <div class="wocs-broadcast-form" id="wocs-broadcast-form" style="display: none;">
          <!-- Message Templates -->
          <div class="wocs-form-section">
            <h4>Message Templates</h4>
            <select id="wocs-broadcast-template">
              <option value="">Select Template</option>
            </select>
            <button class="wocs-btn-sm" id="wocs-insert-template">Insert Template</button>
          </div>
          
          <!-- Message Input -->
          <div class="wocs-form-section">
            <h4>Message</h4>
            <textarea id="wocs-broadcast-message" rows="4" placeholder="Type your broadcast message..."></textarea>
          </div>
          
          <!-- Audience Selection -->
          <div class="wocs-form-section">
            <h4>Audience</h4>
            <div class="wocs-audience-buttons">
              <button class="wocs-btn-toggle active" data-audience="custom">Custom Audience</button>
              <button class="wocs-btn-toggle" data-audience="saved">Saved Audience</button>
            </div>
            
            <div id="wocs-audience-custom">
              <p>Your Freewhich Plan: <span class="wocs-highlight">1</span></p>
              <p>Auto campaign(s) info: <span class="wocs-highlight">0/0</span></p>
              <small>0 campaign(s) running</small>
            </div>
          </div>
          
          <!-- Time Settings -->
          <div class="wocs-form-section">
            <h4>Time Settings</h4>
            <div class="wocs-time-inputs">
              <div class="wocs-form-group">
                <label>Min delay (sec)</label>
                <input type="number" id="wocs-delay-min" value="5" min="1" max="60">
              </div>
              <div class="wocs-form-group">
                <label>Max delay (sec)</label>
                <input type="number" id="wocs-delay-max" value="10" min="1" max="120">
              </div>
            </div>
            
            <div class="wocs-form-group checkbox">
              <label>
                <input type="checkbox" id="wocs-schedule-later">
                Schedule this Broadcast for Future
              </label>
            </div>
            
            <div id="wocs-schedule-options" style="display: none;">
              <div class="wocs-form-group">
                <label>Add delay (days)</label>
                <input type="number" id="wocs-schedule-days" value="0" min="0">
              </div>
              <div class="wocs-form-group">
                <label>Broadcast Time Range (optional)</label>
                <input type="text" id="wocs-time-range" placeholder="e.g., 9:00-17:00">
              </div>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="wocs-broadcast-actions">
            <button class="wocs-btn" id="wocs-cancel-broadcast">Cancel</button>
            <button class="wocs-btn wocs-btn-primary" id="wocs-start-broadcast">
              🚀 Start Broadcast
            </button>
          </div>
        </div>
        
        <!-- Broadcast List -->
        <div class="wocs-broadcast-list" id="wocs-broadcast-list">
          ${this.renderBroadcastList()}
        </div>
      </div>
    `;
    },

    renderBroadcastList() {
        if (this.broadcasts.length === 0) {
            return '<div class="wocs-empty">No broadcasts yet. Click "New Broadcast" to create one.</div>';
        }

        return this.broadcasts.map(b => `
      <div class="wocs-broadcast-item">
        <div class="wocs-broadcast-info">
          <span class="wocs-broadcast-date">${new Date(b.createdAt).toLocaleDateString()}</span>
          <span class="wocs-broadcast-status ${b.status}">${b.status}</span>
        </div>
        <div class="wocs-broadcast-message">${b.message.substring(0, 50)}...</div>
        <div class="wocs-broadcast-stats">
          <span>📤 ${b.sent || 0}</span>
          <span>✅ ${b.success || 0}</span>
          <span>❌ ${b.failed || 0}</span>
        </div>
      </div>
    `).join('');
    },

    init() {
        this.loadBroadcasts();
        this.loadTemplates();
        this.attachEventListeners();
    },

    attachEventListeners() {
        // New broadcast button
        document.getElementById('wocs-new-broadcast')?.addEventListener('click', () => {
            document.getElementById('wocs-broadcast-form').style.display = 'block';
        });

        // Cancel button
        document.getElementById('wocs-cancel-broadcast')?.addEventListener('click', () => {
            document.getElementById('wocs-broadcast-form').style.display = 'none';
        });

        // Schedule toggle
        document.getElementById('wocs-schedule-later')?.addEventListener('change', (e) => {
            document.getElementById('wocs-schedule-options').style.display =
                e.target.checked ? 'block' : 'none';
        });

        // Start broadcast
        document.getElementById('wocs-start-broadcast')?.addEventListener('click', () => {
            this.startBroadcast();
        });

        // Audience toggle buttons
        document.querySelectorAll('.wocs-btn-toggle[data-audience]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.wocs-btn-toggle[data-audience]').forEach(b =>
                    b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    },

    loadBroadcasts() {
        chrome.storage.local.get(['wocsBroadcasts'], (result) => {
            this.broadcasts = result.wocsBroadcasts || [];
        });
    },

    loadTemplates() {
        chrome.storage.local.get(['wocsTemplates'], (result) => {
            const templates = result.wocsTemplates || [];
            const select = document.getElementById('wocs-broadcast-template');
            if (select) {
                select.innerHTML = '<option value="">Select Template</option>' +
                    templates.map(t => `<option value="${t.id}">${t.message.substring(0, 30)}...</option>`).join('');
            }
        });
    },

    async startBroadcast() {
        const message = document.getElementById('wocs-broadcast-message').value;
        if (!message.trim()) {
            alert('Please enter a message');
            return;
        }

        const minDelay = parseInt(document.getElementById('wocs-delay-min').value) * 1000;
        const maxDelay = parseInt(document.getElementById('wocs-delay-max').value) * 1000;

        // Get selected contacts
        const contacts = this.getSelectedContacts();
        if (contacts.length === 0) {
            alert('No contacts selected. Please select audience first.');
            return;
        }

        // Create broadcast record
        const broadcast = {
            id: Date.now().toString(),
            message: message,
            contacts: contacts.length,
            sent: 0,
            success: 0,
            failed: 0,
            status: 'running',
            createdAt: new Date().toISOString()
        };

        this.broadcasts.unshift(broadcast);
        this.saveBroadcasts();

        // Close form
        document.getElementById('wocs-broadcast-form').style.display = 'none';

        // Show notification
        this.showNotification(`Starting broadcast to ${contacts.length} contacts...`);

        // Send messages with delay
        for (let i = 0; i < contacts.length; i++) {
            const contact = contacts[i];
            const delay = Math.random() * (maxDelay - minDelay) + minDelay;

            await this.sleep(delay);

            try {
                // Generate wa.me link and open
                const waLink = `https://wa.me/${contact.number}?text=${encodeURIComponent(message)}`;
                window.open(waLink, '_blank');
                broadcast.success++;
            } catch (e) {
                broadcast.failed++;
            }

            broadcast.sent++;
            this.saveBroadcasts();
        }

        broadcast.status = 'completed';
        this.saveBroadcasts();
        this.showNotification('Broadcast completed!');
    },

    getSelectedContacts() {
        // For now, return empty - will be connected to Audience panel
        return [];
    },

    saveBroadcasts() {
        chrome.storage.local.set({ wocsBroadcasts: this.broadcasts });
        const list = document.getElementById('wocs-broadcast-list');
        if (list) list.innerHTML = this.renderBroadcastList();
    },

    showNotification(message) {
        // Use Chrome notification or DOM notification
        const notif = document.createElement('div');
        notif.className = 'wocs-notification';
        notif.textContent = message;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    },

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
