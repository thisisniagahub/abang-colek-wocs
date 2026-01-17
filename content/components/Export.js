// ==================================================
// WOCS Export Panel
// ==================================================

const WOCS_EXPORT = {
    filters: {
        type: 'all', // all, contacts, groups, non-saved
        category: 'all',
        label: null
    },

    render() {
        return `
      <div class="wocs-export">
        <!-- Tabs -->
        <div class="wocs-export-tabs">
          <button class="wocs-tab active" data-filter="type">Export Contacts</button>
          <button class="wocs-tab" data-filter="fields">Export Fields</button>
        </div>
        
        <!-- Filter Section -->
        <div class="wocs-export-filters">
          <div class="wocs-filter-row">
            <div class="wocs-filter-group">
              <label>Contacts</label>
              <select id="wocs-export-type">
                <option value="all">All</option>
                <option value="contacts">Contacts Only</option>
                <option value="groups">Groups Only</option>
                <option value="non-saved">Non-Saved</option>
              </select>
            </div>
            
            <div class="wocs-filter-group">
              <label>Type</label>
              <select id="wocs-export-category">
                <option value="all">All Contacts</option>
                <option value="recent">Recent</option>
                <option value="frequent">Frequent</option>
              </select>
            </div>
            
            <div class="wocs-filter-group">
              <label>Label</label>
              <select id="wocs-export-label">
                <option value="">All Labels</option>
                <option value="Customer">Customer</option>
                <option value="Supplier">Supplier</option>
                <option value="VIP">VIP</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            
            <div class="wocs-filter-group">
              <label>Custom</label>
              <input type="text" id="wocs-export-custom" placeholder="Search...">
            </div>
          </div>
          
          <div class="wocs-filter-row">
            <div class="wocs-filter-group">
              <label>Category</label>
              <select id="wocs-export-main-cat">
                <option value="ALL">ALL</option>
                <option value="saved">Saved Only</option>
                <option value="groups">Groups</option>
                <option value="non-saved">Non-Saved</option>
              </select>
            </div>
            
            <div class="wocs-filter-group">
              <label>Saved</label>
              <select id="wocs-export-saved">
                <option value="all">All</option>
                <option value="yes">Saved</option>
                <option value="no">Not Saved</option>
              </select>
            </div>
            
            <div class="wocs-filter-group">
              <label>Groups</label>
              <select id="wocs-export-groups">
                <option value="exclude">Exclude</option>
                <option value="include">Include</option>
                <option value="only">Groups Only</option>
              </select>
            </div>
            
            <div class="wocs-filter-group">
              <label>Non-Saved</label>
              <select id="wocs-export-nonsaved">
                <option value="all">ALL</option>
                <option value="include">Include</option>
                <option value="exclude">Exclude</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Export Labels Section -->
        <div class="wocs-export-labels">
          <h4>Export Labels</h4>
          <div class="wocs-label-checkboxes">
            <label><input type="checkbox" value="Customer" checked> Customer</label>
            <label><input type="checkbox" value="Supplier" checked> Supplier</label>
            <label><input type="checkbox" value="VIP" checked> VIP</label>
            <label><input type="checkbox" value="Pending" checked> Pending</label>
          </div>
        </div>
        
        <!-- Export Enhancement -->
        <div class="wocs-export-enhancement">
          <h4>Export Enhancement</h4>
          <div class="wocs-enhancement-grid">
            <label><input type="checkbox" id="wocs-exp-country"> Country Code</label>
            <label><input type="checkbox" id="wocs-exp-lastmsg"> Last Message Time/Date</label>
            <label><input type="checkbox" id="wocs-exp-business"> Business or Personal</label>
            <label><input type="checkbox" id="wocs-exp-labels"> Smart Labels</label>
            <label><input type="checkbox" id="wocs-exp-filter"> Country Filter</label>
            <label><input type="checkbox" id="wocs-exp-custom"> Add Custom Name</label>
          </div>
        </div>
        
        <!-- Export Actions -->
        <div class="wocs-export-actions">
          <button class="wocs-btn" id="wocs-export-refresh">🔄 Refresh</button>
          <button class="wocs-btn wocs-btn-primary" id="wocs-export-download">📥 Export</button>
        </div>
        
        <!-- Preview -->
        <div class="wocs-export-preview">
          <h4>Preview (<span id="wocs-export-count">0</span> contacts)</h4>
          <div class="wocs-preview-table" id="wocs-preview-table">
            <!-- Will be populated dynamically -->
          </div>
        </div>
      </div>
    `;
    },

    init() {
        this.attachEventListeners();
        this.refreshPreview();
    },

    attachEventListeners() {
        // Export button
        document.getElementById('wocs-export-download')?.addEventListener('click', () => {
            this.exportContacts();
        });

        // Refresh button
        document.getElementById('wocs-export-refresh')?.addEventListener('click', () => {
            this.refreshPreview();
        });

        // Filter changes
        document.querySelectorAll('.wocs-export-filters select, .wocs-export-filters input').forEach(el => {
            el.addEventListener('change', () => this.refreshPreview());
        });
    },

    refreshPreview() {
        const contacts = this.collectContacts();
        const countEl = document.getElementById('wocs-export-count');
        const tableEl = document.getElementById('wocs-preview-table');

        if (countEl) countEl.textContent = contacts.length;

        if (tableEl) {
            if (contacts.length === 0) {
                tableEl.innerHTML = '<p class="wocs-empty">No contacts found</p>';
            } else {
                tableEl.innerHTML = `
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Number</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              ${contacts.slice(0, 10).map(c => `
                <tr>
                  <td>${c.name}</td>
                  <td>${c.number}</td>
                  <td>${c.type}</td>
                </tr>
              `).join('')}
              ${contacts.length > 10 ? `<tr><td colspan="3">... and ${contacts.length - 10} more</td></tr>` : ''}
            </tbody>
          </table>
        `;
            }
        }
    },

    collectContacts() {
        const contacts = [];
        const chatList = document.querySelectorAll('[data-testid="cell-frame-container"]');

        const typeFilter = document.getElementById('wocs-export-type')?.value || 'all';
        const groupsFilter = document.getElementById('wocs-export-groups')?.value || 'exclude';

        chatList.forEach(chat => {
            const nameEl = chat.querySelector('[data-testid="cell-frame-title"]');
            const isGroup = !!chat.querySelector('[data-icon="default-group"]');

            if (!nameEl) return;

            const name = nameEl.textContent;
            const isSaved = !/^\+?\d[\d\s-]+$/.test(name);

            // Apply filters
            if (groupsFilter === 'exclude' && isGroup) return;
            if (groupsFilter === 'only' && !isGroup) return;
            if (typeFilter === 'contacts' && isGroup) return;
            if (typeFilter === 'groups' && !isGroup) return;
            if (typeFilter === 'non-saved' && isSaved) return;

            contacts.push({
                name: name,
                number: isSaved ? '' : name,
                type: isGroup ? 'Group' : (isSaved ? 'Saved' : 'Non-Saved'),
                isGroup,
                isSaved
            });
        });

        return contacts;
    },

    exportContacts() {
        const contacts = this.collectContacts();

        if (contacts.length === 0) {
            alert('No contacts to export');
            return;
        }

        // Generate CSV
        const headers = ['Name', 'Number', 'Type'];
        const rows = contacts.map(c => [c.name, c.number, c.type]);

        const csv = [
            headers.join(','),
            ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wocs-contacts-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        // Update stats
        if (typeof WOCS_ANALYTICS !== 'undefined') {
            WOCS_ANALYTICS.incrementStat('messages', contacts.length);
        }
    }
};
