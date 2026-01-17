// ==================================================
// WOCS Support Panel
// ==================================================

const WOCS_SUPPORT = {
    faqs: [
        {
            q: 'How do I export contacts?',
            a: 'Click the Export icon in the sidebar, apply filters if needed, then click "Export" to download a CSV file.'
        },
        {
            q: 'How do I send bulk messages?',
            a: 'Go to Broadcasts panel, create a new broadcast, select your audience, write your message, and click Start Broadcast.'
        },
        {
            q: 'Is this extension safe to use?',
            a: 'Yes, but use responsibly. WhatsApp may block accounts that spam. Always add delays between messages.'
        },
        {
            q: 'How do I create templates?',
            a: 'Go to Templates panel, click "Add Template", write your message, and optionally enable Quick Reply.'
        },
        {
            q: 'Where can I find the license key?',
            a: 'This is a free extension by Abang Colek. No license key required!'
        }
    ],

    render() {
        return `
      <div class="wocs-support">
        <!-- Search -->
        <div class="wocs-support-search">
          <input type="text" id="wocs-faq-search" placeholder="Search FAQ..." class="wocs-search">
        </div>
        
        <!-- FAQ List -->
        <div class="wocs-faq-list" id="wocs-faq-list">
          ${this.faqs.map((faq, i) => `
            <div class="wocs-faq-item">
              <button class="wocs-faq-question" data-index="${i}">
                <span>${faq.q}</span>
                <span class="wocs-faq-toggle">▼</span>
              </button>
              <div class="wocs-faq-answer" id="wocs-faq-answer-${i}">
                ${faq.a}
              </div>
            </div>
          `).join('')}
        </div>
        
        <!-- Contact Section -->
        <div class="wocs-support-contact">
          <button class="wocs-btn wocs-btn-primary" id="wocs-live-chat">
            💬 Live Chat with Support
          </button>
          <p>Or</p>
          <p>Email Us: <a href="mailto:support@liurlelehhouse.com">support@liurlelehhouse.com</a></p>
        </div>
        
        <!-- Join Community -->
        <div class="wocs-support-community">
          <h4>Join WOCS Family</h4>
          <p>Use your phone camera to scan the QR code</p>
          <div class="wocs-qr-placeholder">
            <div class="wocs-qr-code">📱 QR Code</div>
          </div>
          <div class="wocs-social-links">
            <a href="https://instagram.com/abangcolek" target="_blank" title="Instagram">📷</a>
            <a href="https://tiktok.com/@abangcolek" target="_blank" title="TikTok">🎵</a>
            <a href="https://facebook.com/abangcolek" target="_blank" title="Facebook">📘</a>
            <a href="https://twitter.com/abangcolek" target="_blank" title="Twitter">🐦</a>
          </div>
        </div>
        
        <!-- Version Info -->
        <div class="wocs-version-info">
          <p>WOCS Extension v1.0.0</p>
          <p>By Liurleleh House / Abang Colek</p>
        </div>
      </div>
    `;
    },

    init() {
        this.attachEventListeners();
    },

    attachEventListeners() {
        // FAQ accordion
        document.querySelectorAll('.wocs-faq-question').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.currentTarget.dataset.index;
                const answer = document.getElementById(`wocs-faq-answer-${index}`);
                const toggle = e.currentTarget.querySelector('.wocs-faq-toggle');

                if (answer) {
                    const isOpen = answer.classList.toggle('open');
                    toggle.textContent = isOpen ? '▲' : '▼';
                }
            });
        });

        // FAQ search
        document.getElementById('wocs-faq-search')?.addEventListener('input', (e) => {
            this.searchFAQs(e.target.value);
        });

        // Live chat button
        document.getElementById('wocs-live-chat')?.addEventListener('click', () => {
            // Open WhatsApp chat with support
            window.open('https://wa.me/60123456789?text=Hi, I need help with WOCS extension', '_blank');
        });
    },

    searchFAQs(query) {
        const items = document.querySelectorAll('.wocs-faq-item');
        const lowerQuery = query.toLowerCase();

        items.forEach((item, i) => {
            const faq = this.faqs[i];
            const matches = faq.q.toLowerCase().includes(lowerQuery) ||
                faq.a.toLowerCase().includes(lowerQuery);
            item.style.display = matches ? '' : 'none';
        });
    }
};
