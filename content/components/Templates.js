// ==================================================
// WOCS Templates Panel
// ==================================================

const WOCS_TEMPLATES = {
    templates: [],
    currentPage: 1,
    perPage: 5,

    render() {
        return `
      <div class="wocs-templates">
        <!-- Add Template Button -->
        <div class="wocs-templates-header">
          <button class="wocs-btn wocs-btn-primary" id="wocs-add-template">
            + Add Template
          </button>
        </div>
        
        <!-- Template Editor (hidden by default) -->
        <div class="wocs-template-editor" id="wocs-template-editor" style="display: none;">
          <div class="wocs-form-group">
            <label>Message</label>
            <div class="wocs-editor-toolbar">
              <button type="button" title="Bold">B</button>
              <button type="button" title="Italic">I</button>
              <button type="button" title="Strikethrough">S</button>
              <button type="button" title="Emoji">😊</button>
            </div>
            <textarea id="wocs-template-message" placeholder="Enter your template message..." rows="4"></textarea>
          </div>
          
          <div class="wocs-form-group">
            <label>Media</label>
            <input type="file" id="wocs-template-media" accept="image/*,video/*">
          </div>
          
          <div class="wocs-form-group">
            <label>Attachments</label>
            <input type="file" id="wocs-template-attachment">
          </div>
          
          <div class="wocs-form-group">
            <label>File</label>
            <input type="file" id="wocs-template-file">
          </div>
          
          <div class="wocs-form-group">
            <label>Contact</label>
            <input type="text" id="wocs-template-contact" placeholder="Contact name">
          </div>
          
          <div class="wocs-form-group checkbox">
            <label>
              <input type="checkbox" id="wocs-template-quickreply">
              Add to Quick Reply
            </label>
          </div>
          
          <div class="wocs-template-actions">
            <button class="wocs-btn" id="wocs-cancel-template">Cancel</button>
            <button class="wocs-btn wocs-btn-primary" id="wocs-save-template">Save Template</button>
          </div>
        </div>
        
        <!-- Template List -->
        <div class="wocs-template-list" id="wocs-template-list">
          ${this.renderTemplateList()}
        </div>
        
        <!-- Pagination -->
        <div class="wocs-pagination" id="wocs-template-pagination">
          ${this.renderPagination()}
        </div>
      </div>
    `;
    },

    renderTemplateList() {
        if (this.templates.length === 0) {
            return '<div class="wocs-empty">No templates yet. Click "Add Template" to create one.</div>';
        }

        const start = (this.currentPage - 1) * this.perPage;
        const pageTemplates = this.templates.slice(start, start + this.perPage);

        return pageTemplates.map((template, index) => `
      <div class="wocs-template-item" data-id="${template.id}">
        <div class="wocs-template-content">
          <div class="wocs-template-message">${template.message}</div>
          ${template.hasMedia ? '<span class="wocs-badge">📷 Media</span>' : ''}
          ${template.isQuickReply ? '<span class="wocs-badge quick">⚡ Quick Reply</span>' : ''}
        </div>
        <div class="wocs-template-actions">
          <button class="wocs-template-use" data-id="${template.id}" title="Use">📤</button>
          <button class="wocs-template-edit" data-id="${template.id}" title="Edit">✏️</button>
          <button class="wocs-template-delete" data-id="${template.id}" title="Delete">🗑️</button>
        </div>
      </div>
    `).join('');
    },

    renderPagination() {
        const totalPages = Math.ceil(this.templates.length / this.perPage);
        if (totalPages <= 1) return '';

        return `
      <span>${this.currentPage} of ${totalPages}</span>
      <button class="wocs-btn-sm" ${this.currentPage === 1 ? 'disabled' : ''} id="wocs-prev-page">Previous</button>
      <button class="wocs-btn-sm" ${this.currentPage === totalPages ? 'disabled' : ''} id="wocs-next-page">Next</button>
    `;
    },

    init() {
        this.loadTemplates();
        this.attachEventListeners();
    },

    attachEventListeners() {
        // Add template button
        document.getElementById('wocs-add-template')?.addEventListener('click', () => {
            document.getElementById('wocs-template-editor').style.display = 'block';
        });

        // Cancel button
        document.getElementById('wocs-cancel-template')?.addEventListener('click', () => {
            document.getElementById('wocs-template-editor').style.display = 'none';
            this.clearEditor();
        });

        // Save button
        document.getElementById('wocs-save-template')?.addEventListener('click', () => {
            this.saveTemplate();
        });

        // Use template
        document.querySelectorAll('.wocs-template-use').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.useTemplate(id);
            });
        });

        // Delete template
        document.querySelectorAll('.wocs-template-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.deleteTemplate(id);
            });
        });

        // Pagination
        document.getElementById('wocs-prev-page')?.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.refreshList();
            }
        });

        document.getElementById('wocs-next-page')?.addEventListener('click', () => {
            const totalPages = Math.ceil(this.templates.length / this.perPage);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.refreshList();
            }
        });
    },

    loadTemplates() {
        chrome.storage.local.get(['wocsTemplates'], (result) => {
            this.templates = result.wocsTemplates || [];
            this.refreshList();
        });
    },

    saveTemplate() {
        const message = document.getElementById('wocs-template-message').value;
        if (!message.trim()) {
            alert('Message is required');
            return;
        }

        const template = {
            id: Date.now().toString(),
            message: message.trim(),
            hasMedia: !!document.getElementById('wocs-template-media').files.length,
            isQuickReply: document.getElementById('wocs-template-quickreply').checked,
            createdAt: new Date().toISOString()
        };

        this.templates.push(template);
        chrome.storage.local.set({ wocsTemplates: this.templates });

        document.getElementById('wocs-template-editor').style.display = 'none';
        this.clearEditor();
        this.refreshList();
    },

    deleteTemplate(id) {
        if (!confirm('Delete this template?')) return;
        this.templates = this.templates.filter(t => t.id !== id);
        chrome.storage.local.set({ wocsTemplates: this.templates });
        this.refreshList();
    },

    useTemplate(id) {
        const template = this.templates.find(t => t.id === id);
        if (!template) return;

        // Find WhatsApp input and insert message
        const input = document.querySelector('[data-testid="conversation-compose-box-input"]');
        if (input) {
            input.focus();
            document.execCommand('insertText', false, template.message);
        }
    },

    clearEditor() {
        document.getElementById('wocs-template-message').value = '';
        document.getElementById('wocs-template-quickreply').checked = false;
    },

    refreshList() {
        const listEl = document.getElementById('wocs-template-list');
        const paginationEl = document.getElementById('wocs-template-pagination');

        if (listEl) listEl.innerHTML = this.renderTemplateList();
        if (paginationEl) paginationEl.innerHTML = this.renderPagination();

        this.attachEventListeners();
    }
};
