// ==================================================
// WOCS Audience Panel
// ==================================================

const WOCS_AUDIENCE = {
    audiences: [],

    render() {
        return `
      <div class="wocs-audience">
        <!-- Header -->
        <div class="wocs-audience-header">
          <input type="text" id="wocs-audience-search" placeholder="Search audiences..." class="wocs-search">
          <button class="wocs-btn wocs-btn-primary" id="wocs-new-audience">
            + New Audience
          </button>
        </div>
        
        <!-- Audience Form -->
        <div class="wocs-audience-form" id="wocs-audience-form" style="display: none;">
          <div class="wocs-form-group">
            <label>Audience Name</label>
            <input type="text" id="wocs-audience-name" placeholder="e.g., VIP Customers">
          </div>
          
          <!-- Filters -->
          <div class="wocs-form-section">
            <h4>Add Audiences</h4>
            
            <div class="wocs-filter-grid">
              <div class="wocs-form-group">
                <label>Phone</label>
                <input type="text" id="wocs-filter-phone" placeholder="Phone number or prefix">
              </div>
              
              <div class="wocs-form-group">
                <label>Country</label>
                <select id="wocs-filter-country">
                  <option value="">All Countries</option>
                  <option value="+60">Malaysia (+60)</option>
                  <option value="+65">Singapore (+65)</option>
                  <option value="+1">USA (+1)</option>
                  <option value="+44">UK (+44)</option>
                </select>
              </div>
              
              <div class="wocs-form-group">
                <label>Labels</label>
                <select id="wocs-filter-labels">
                  <option value="">All Labels</option>
                  <option value="Customer">Customer</option>
                  <option value="Supplier">Supplier</option>
                  <option value="VIP">VIP</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              
              <div class="wocs-form-group">
                <label>Group Participants</label>
                <select id="wocs-filter-group">
                  <option value="">Select Group</option>
                </select>
              </div>
            </div>
          </div>
          
          <!-- Selected Contacts Preview -->
          <div class="wocs-form-section">
            <h4>Selected Contacts (<span id="wocs-audience-count">0</span>)</h4>
            <div class="wocs-contact-preview" id="wocs-contact-preview">
              <p class="wocs-empty">Apply filters to see matching contacts</p>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="wocs-audience-actions">
            <button class="wocs-btn" id="wocs-cancel-audience">Cancel</button>
            <button class="wocs-btn" id="wocs-download-csv">📥 Download as CSV</button>
            <button class="wocs-btn wocs-btn-primary" id="wocs-save-audience">Save Audience</button>
          </div>
        </div>
        
        <!-- Audience List -->
        <div class="wocs-audience-list" id="wocs-audience-list">
          ${this.renderAudienceList()}
        </div>
      </div>
    `;
    },

    renderAudienceList() {
        if (this.audiences.length === 0) {
            return `
        <div class="wocs-empty-state">
          <p>No audiences available.</p>
          <p>To use the Audience select the Label/Phone/Country to find contacts</p>
        </div>
      `;
        }

        return this.audiences.map(a => `
      <div class="wocs-audience-item" data-id="${a.id}">
        <div class="wocs-audience-info">
          <h4>${a.name}</h4>
          <span>${a.contacts.length} contacts</span>
          <small>Created: ${new Date(a.createdAt).toLocaleDateString()}</small>
        </div>
        <div class="wocs-audience-item-actions">
          <button class="wocs-btn-icon" data-action="use" title="Use in Broadcast">📤</button>
          <button class="wocs-btn-icon" data-action="edit" title="Edit">✏️</button>
          <button class="wocs-btn-icon" data-action="delete" title="Delete">🗑️</button>
        </div>
      </div>
    `).join('');
    },

    init() {
        this.loadAudiences();
        this.loadGroups();
        this.attachEventListeners();
    },

    attachEventListeners() {
        // New audience button
        document.getElementById('wocs-new-audience')?.addEventListener('click', () => {
            document.getElementById('wocs-audience-form').style.display = 'block';
        });

        // Cancel button
        document.getElementById('wocs-cancel-audience')?.addEventListener('click', () => {
            document.getElementById('wocs-audience-form').style.display = 'none';
        });

        // Save audience
        document.getElementById('wocs-save-audience')?.addEventListener('click', () => {
            this.saveAudience();
        });

        // Download CSV
        document.getElementById('wocs-download-csv')?.addEventListener('click', () => {
            this.downloadCSV();
        });

        // Filter changes
        const filters = ['wocs-filter-phone', 'wocs-filter-country', 'wocs-filter-labels', 'wocs-filter-group'];
        filters.forEach(id => {
            document.getElementById(id)?.addEventListener('change', () => {
                this.applyFilters();
            });
        });

        // Search
        document.getElementById('wocs-audience-search')?.addEventListener('input', (e) => {
            this.searchAudiences(e.target.value);
        });

        // Audience item actions
        document.querySelectorAll('.wocs-audience-item button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const id = e.target.closest('.wocs-audience-item').dataset.id;
                this.handleAction(action, id);
            });
        });
    },

    loadAudiences() {
        chrome.storage.local.get(['wocsAudiences'], (result) => {
            this.audiences = result.wocsAudiences || [];
            const list = document.getElementById('wocs-audience-list');
            if (list) list.innerHTML = this.renderAudienceList();
        });
    },

    loadGroups() {
        // Find all groups in chat list
        const groups = [];
        const chatList = document.querySelectorAll('[data-testid="cell-frame-container"]');

        chatList.forEach(chat => {
            if (chat.querySelector('[data-icon="default-group"]')) {
                const nameEl = chat.querySelector('[data-testid="cell-frame-title"]');
                if (nameEl) {
                    groups.push(nameEl.textContent);
                }
            }
        });

        const select = document.getElementById('wocs-filter-group');
        if (select) {
            select.innerHTML = '<option value="">Select Group</option>' +
                groups.map(g => `<option value="${g}">${g}</option>`).join('');
        }
    },

    applyFilters() {
        const phone = document.getElementById('wocs-filter-phone')?.value || '';
        const country = document.getElementById('wocs-filter-country')?.value || '';
        const label = document.getElementById('wocs-filter-labels')?.value || '';

        const contacts = [];
        const chatList = document.querySelectorAll('[data-testid="cell-frame-container"]');

        chatList.forEach(chat => {
            const nameEl = chat.querySelector('[data-testid="cell-frame-title"]');
            if (!nameEl) return;

            const name = nameEl.textContent;

            // Apply filters
            if (country && !name.startsWith(country)) return;
            if (phone && !name.includes(phone)) return;

            contacts.push({ name, number: name });
        });

        // Update preview
        const countEl = document.getElementById('wocs-audience-count');
        const previewEl = document.getElementById('wocs-contact-preview');

        if (countEl) countEl.textContent = contacts.length;
        if (previewEl) {
            previewEl.innerHTML = contacts.length === 0
                ? '<p class="wocs-empty">No matching contacts</p>'
                : contacts.slice(0, 5).map(c => `<div class="wocs-contact-chip">${c.name}</div>`).join('') +
                (contacts.length > 5 ? `<div class="wocs-more">+${contacts.length - 5} more</div>` : '');
        }

        this.currentContacts = contacts;
    },

    saveAudience() {
        const name = document.getElementById('wocs-audience-name')?.value;
        if (!name) {
            alert('Please enter audience name');
            return;
        }

        if (!this.currentContacts || this.currentContacts.length === 0) {
            alert('No contacts selected');
            return;
        }

        const audience = {
            id: Date.now().toString(),
            name: name,
            contacts: this.currentContacts,
            createdAt: new Date().toISOString()
        };

        this.audiences.push(audience);
        chrome.storage.local.set({ wocsAudiences: this.audiences });

        document.getElementById('wocs-audience-form').style.display = 'none';
        const list = document.getElementById('wocs-audience-list');
        if (list) list.innerHTML = this.renderAudienceList();
    },

    handleAction(action, id) {
        const audience = this.audiences.find(a => a.id === id);
        if (!audience) return;

        switch (action) {
            case 'delete':
                if (confirm(`Delete audience "${audience.name}"?`)) {
                    this.audiences = this.audiences.filter(a => a.id !== id);
                    chrome.storage.local.set({ wocsAudiences: this.audiences });
                    const list = document.getElementById('wocs-audience-list');
                    if (list) list.innerHTML = this.renderAudienceList();
                }
                break;
            case 'use':
                // Switch to broadcasts panel with this audience selected
                WOCS_SIDEBAR.togglePanel('broadcasts');
                break;
        }
    },

    downloadCSV() {
        if (!this.currentContacts || this.currentContacts.length === 0) {
            alert('No contacts to download');
            return;
        }

        const csv = 'Name,Number\n' +
            this.currentContacts.map(c => `"${c.name}","${c.number}"`).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'wocs-audience.csv';
        a.click();
    },

    searchAudiences(query) {
        const list = document.getElementById('wocs-audience-list');
        if (!list) return;

        if (!query) {
            list.innerHTML = this.renderAudienceList();
            return;
        }

        const filtered = this.audiences.filter(a =>
            a.name.toLowerCase().includes(query.toLowerCase())
        );

        list.innerHTML = filtered.length === 0
            ? '<p class="wocs-empty">No matching audiences</p>'
            : filtered.map(a => `
          <div class="wocs-audience-item" data-id="${a.id}">
            <h4>${a.name}</h4>
            <span>${a.contacts.length} contacts</span>
          </div>
        `).join('');
    },

    currentContacts: []
};
