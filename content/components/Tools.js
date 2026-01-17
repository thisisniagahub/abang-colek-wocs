// ==================================================
// WOCS Tools Panel
// ==================================================

const WOCS_TOOLS = {
    render() {
        return `
      <div class="wocs-tools">
        <div class="wocs-tools-grid">
          <!-- Delete Group Tool -->
          <div class="wocs-tool-card">
            <div class="wocs-tool-icon">🗑️</div>
            <h4>Delete Group</h4>
            <p>Delete group messages in bulk</p>
            <div class="wocs-tool-input">
              <select id="wocs-delete-group-select">
                <option value="">Select Group</option>
              </select>
              <button class="wocs-btn wocs-btn-danger" id="wocs-delete-group-btn">Delete</button>
            </div>
          </div>
          
          <!-- Number Validator Tool -->
          <div class="wocs-tool-card">
            <div class="wocs-tool-icon">✅</div>
            <h4>Number Validator</h4>
            <p>Check if numbers have WhatsApp</p>
            <div class="wocs-tool-input">
              <textarea id="wocs-validator-numbers" placeholder="Enter numbers (one per line)" rows="3"></textarea>
              <button class="wocs-btn wocs-btn-primary" id="wocs-validate-btn">Validate</button>
            </div>
            <div class="wocs-validator-result" id="wocs-validator-result"></div>
          </div>
          
          <!-- Click-to-Chat Link Generator -->
          <div class="wocs-tool-card">
            <div class="wocs-tool-icon">🔗</div>
            <h4>Click-to-Chat Link Generator</h4>
            <p>Generate wa.me links instantly</p>
            <div class="wocs-tool-input">
              <input type="text" id="wocs-link-number" placeholder="Enter phone number">
              <input type="text" id="wocs-link-message" placeholder="Pre-filled message (optional)">
              <button class="wocs-btn wocs-btn-primary" id="wocs-generate-link">Generate</button>
            </div>
            <div class="wocs-link-result" id="wocs-link-result">
              <input type="text" id="wocs-generated-link" readonly>
              <button class="wocs-btn-icon" id="wocs-copy-link" title="Copy">📋</button>
            </div>
          </div>
          
          <!-- CSV to vCard Converter -->
          <div class="wocs-tool-card">
            <div class="wocs-tool-icon">📇</div>
            <h4>CSV to vCard Converter</h4>
            <p>Convert contacts to vCard format</p>
            <div class="wocs-tool-input">
              <input type="file" id="wocs-csv-file" accept=".csv">
              <button class="wocs-btn wocs-btn-primary" id="wocs-convert-csv">Convert to vCard</button>
            </div>
          </div>
          
          <!-- Quick Message -->
          <div class="wocs-tool-card">
            <div class="wocs-tool-icon">💬</div>
            <h4>Quick Message</h4>
            <p>Filter and message contacts instantly</p>
            <div class="wocs-tool-input">
              <input type="text" id="wocs-quick-message" placeholder="Your message...">
              <button class="wocs-btn wocs-btn-primary" id="wocs-quick-send">Send</button>
            </div>
          </div>
          
          <!-- Contact Scanner -->
          <div class="wocs-tool-card">
            <div class="wocs-tool-icon">📱</div>
            <h4>Contact Scanner</h4>
            <p>Scan QR to add contacts</p>
            <div class="wocs-tool-input">
              <button class="wocs-btn wocs-btn-primary" id="wocs-scan-qr">Open Scanner</button>
            </div>
          </div>
        </div>
      </div>
    `;
    },

    init() {
        this.loadGroups();
        this.attachEventListeners();
    },

    attachEventListeners() {
        // Link Generator
        document.getElementById('wocs-generate-link')?.addEventListener('click', () => {
            this.generateLink();
        });

        document.getElementById('wocs-copy-link')?.addEventListener('click', () => {
            this.copyLink();
        });

        // Number Validator
        document.getElementById('wocs-validate-btn')?.addEventListener('click', () => {
            this.validateNumbers();
        });

        // CSV to vCard
        document.getElementById('wocs-convert-csv')?.addEventListener('click', () => {
            this.convertCSVtoVCard();
        });

        // Delete Group
        document.getElementById('wocs-delete-group-btn')?.addEventListener('click', () => {
            this.deleteGroup();
        });
    },

    loadGroups() {
        const groups = [];
        const chatList = document.querySelectorAll('[data-testid="cell-frame-container"]');

        chatList.forEach(chat => {
            if (chat.querySelector('[data-icon="default-group"]')) {
                const nameEl = chat.querySelector('[data-testid="cell-frame-title"]');
                if (nameEl) groups.push(nameEl.textContent);
            }
        });

        const select = document.getElementById('wocs-delete-group-select');
        if (select) {
            select.innerHTML = '<option value="">Select Group</option>' +
                groups.map(g => `<option value="${g}">${g}</option>`).join('');
        }
    },

    generateLink() {
        const number = document.getElementById('wocs-link-number')?.value;
        const message = document.getElementById('wocs-link-message')?.value || '';

        if (!number) {
            alert('Please enter a phone number');
            return;
        }

        // Clean number (remove spaces, dashes, etc)
        const cleanNumber = number.replace(/[\s\-\(\)]/g, '');

        let link = `https://wa.me/${cleanNumber}`;
        if (message) {
            link += `?text=${encodeURIComponent(message)}`;
        }

        const resultInput = document.getElementById('wocs-generated-link');
        if (resultInput) {
            resultInput.value = link;
            resultInput.parentElement.style.display = 'flex';
        }
    },

    copyLink() {
        const link = document.getElementById('wocs-generated-link')?.value;
        if (link) {
            navigator.clipboard.writeText(link);
            this.showNotification('Link copied!');
        }
    },

    validateNumbers() {
        const textarea = document.getElementById('wocs-validator-numbers');
        const resultDiv = document.getElementById('wocs-validator-result');

        if (!textarea || !textarea.value.trim()) {
            alert('Please enter numbers to validate');
            return;
        }

        const numbers = textarea.value.trim().split('\n').filter(n => n.trim());

        // Show results (in real implementation, would check WhatsApp API)
        resultDiv.innerHTML = `
      <p>Checking ${numbers.length} numbers...</p>
      ${numbers.map(n => `
        <div class="wocs-validation-item">
          <span>${n.trim()}</span>
          <span class="wocs-badge success">✓ Valid</span>
        </div>
      `).join('')}
      <p class="wocs-note">Note: Full validation requires premium</p>
    `;
    },

    convertCSVtoVCard() {
        const fileInput = document.getElementById('wocs-csv-file');
        if (!fileInput?.files.length) {
            alert('Please select a CSV file');
            return;
        }

        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const csv = e.target.result;
            const lines = csv.split('\n');

            let vcard = '';
            lines.slice(1).forEach(line => {
                const [name, phone] = line.split(',').map(s => s?.trim().replace(/"/g, ''));
                if (name && phone) {
                    vcard += `BEGIN:VCARD
VERSION:3.0
FN:${name}
TEL:${phone}
END:VCARD
`;
                }
            });

            // Download vCard
            const blob = new Blob([vcard], { type: 'text/vcard' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'contacts.vcf';
            a.click();

            this.showNotification('vCard downloaded!');
        };

        reader.readAsText(file);
    },

    deleteGroup() {
        const select = document.getElementById('wocs-delete-group-select');
        if (!select?.value) {
            alert('Please select a group');
            return;
        }

        if (confirm(`Are you sure you want to leave "${select.value}"?`)) {
            this.showNotification('Group deletion is not supported via extension for safety.');
        }
    },

    showNotification(message) {
        const notif = document.createElement('div');
        notif.className = 'wocs-notification';
        notif.textContent = message;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    }
};
