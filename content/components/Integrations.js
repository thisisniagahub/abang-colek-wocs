// ==================================================
// WOCS Integrations Panel (Expanded)
// Social Media, Apps, MCP Servers, AI Agents
// ==================================================

const WOCS_INTEGRATIONS = {
  categories: {
    crm: {
      title: '🏢 CRM & Business',
      items: [
        { id: 'hubspot', name: 'HubSpot', icon: '🟠', desc: 'Sync contacts with HubSpot CRM' },
        { id: 'airtable', name: 'Airtable', icon: '🔵', desc: 'Sync data with Airtable bases' },
        { id: 'notion', name: 'Notion', icon: '⬛', desc: 'Push to Notion databases' },
        { id: 'monday', name: 'Monday.com', icon: '🔴', desc: 'Create tasks in Monday boards' },
        { id: 'trello', name: 'Trello', icon: '🟦', desc: 'Add cards to Trello boards' },
        { id: 'zoho', name: 'Zoho CRM', icon: '🟡', desc: 'Sync with Zoho CRM' }
      ]
    },
    social: {
      title: '📱 Social Media',
      items: [
        { id: 'instagram', name: 'Instagram', icon: '📸', desc: 'Cross-post to Instagram DMs' },
        { id: 'facebook', name: 'Facebook', icon: '📘', desc: 'Sync with Messenger' },
        { id: 'tiktok', name: 'TikTok', icon: '🎵', desc: 'Export leads from TikTok' },
        { id: 'twitter', name: 'X (Twitter)', icon: '🐦', desc: 'Sync DMs with X' },
        { id: 'telegram', name: 'Telegram', icon: '✈️', desc: 'Bridge with Telegram bots' },
        { id: 'linkedin', name: 'LinkedIn', icon: '💼', desc: 'Sync LinkedIn messages' }
      ]
    },
    ecommerce: {
      title: '🛒 E-Commerce',
      items: [
        { id: 'shopify', name: 'Shopify', icon: '🟢', desc: 'Sync orders & customers' },
        { id: 'woocommerce', name: 'WooCommerce', icon: '🟣', desc: 'WordPress store sync' },
        { id: 'lazada', name: 'Lazada', icon: '🔷', desc: 'Connect Lazada seller' },
        { id: 'shopee', name: 'Shopee', icon: '🧡', desc: 'Connect Shopee seller' },
        { id: 'tiktokshop', name: 'TikTok Shop', icon: '🎪', desc: 'Sync TikTok Shop orders' }
      ]
    },
    ai: {
      title: '🤖 AI Agents & Assistants',
      items: [
        { id: 'openai', name: 'OpenAI / ChatGPT', icon: '🧠', desc: 'AI-powered auto-replies', premium: true },
        { id: 'claude', name: 'Claude (Anthropic)', icon: '🔮', desc: 'Claude AI responses', premium: true },
        { id: 'gemini', name: 'Google Gemini', icon: '💎', desc: 'Gemini AI integration', premium: true },
        { id: 'copilot', name: 'GitHub Copilot', icon: '🚀', desc: 'Code assistance in chats' },
        { id: 'ollama', name: 'Ollama (Local)', icon: '🦙', desc: 'Local LLM integration' },
        { id: 'custom-agent', name: 'Custom AI Agent', icon: '⚡', desc: 'Your own AI agent endpoint' }
      ]
    },
    mcp: {
      title: '🔌 MCP Servers',
      items: [
        { id: 'mcp-supabase', name: 'Supabase MCP', icon: '⚡', desc: 'Database operations via MCP' },
        { id: 'mcp-github', name: 'GitHub MCP', icon: '🐙', desc: 'GitHub actions via MCP' },
        { id: 'mcp-prisma', name: 'Prisma MCP', icon: '🔷', desc: 'Database management' },
        { id: 'mcp-sequential', name: 'Sequential Thinking', icon: '🧩', desc: 'Complex reasoning chains' },
        { id: 'mcp-shadcn', name: 'shadcn/ui MCP', icon: '🎨', desc: 'UI component generation' },
        { id: 'mcp-custom', name: 'Custom MCP Server', icon: '🔧', desc: 'Connect your own MCP server' }
      ]
    },
    automation: {
      title: '⚙️ Automation & Workflows',
      items: [
        { id: 'zapier', name: 'Zapier', icon: '⚡', desc: 'Connect 5000+ apps' },
        { id: 'make', name: 'Make (Integromat)', icon: '🟪', desc: 'Visual automation builder' },
        { id: 'n8n', name: 'n8n', icon: '🔶', desc: 'Self-hosted automation' },
        { id: 'webhook', name: 'Custom Webhook', icon: '🔗', desc: 'Send to any webhook URL' },
        { id: 'ifttt', name: 'IFTTT', icon: '🔀', desc: 'If This Then That' }
      ]
    },
    brandos: {
      title: '🌶️ Abang Colek Ecosystem',
      items: [
        { id: 'brandos', name: 'Brand OS', icon: '🌶️', desc: 'Sync with Brand OS dashboard', featured: true },
        { id: 'wassist', name: 'Wassist API', icon: '💬', desc: 'WhatsApp Cloud API bridge' },
        { id: 'quranpulse', name: 'QuranPulse', icon: '📖', desc: 'Islamic content integration' }
      ]
    }
  },

  activeIntegrations: {},

  render() {
    return `
      <div class="wocs-integrations">
        <div class="wocs-integrations-search">
          <input type="text" id="wocs-integration-search" placeholder="Search integrations..." class="wocs-search">
        </div>
        
        <div class="wocs-integration-categories" id="wocs-integration-list">
          ${Object.entries(this.categories).map(([key, category]) => `
            <div class="wocs-category" data-category="${key}">
              <h3 class="wocs-category-title">${category.title}</h3>
              <div class="wocs-category-items">
                ${category.items.map(item => `
                  <div class="wocs-integration-card ${item.featured ? 'featured' : ''} ${item.premium ? 'premium' : ''}" data-id="${item.id}">
                    <div class="wocs-integration-header">
                      <div class="wocs-integration-icon">${item.icon}</div>
                      <div class="wocs-integration-info">
                        <h4>${item.name} ${item.premium ? '<span class="wocs-badge premium">PRO</span>' : ''}</h4>
                        <p>${item.desc}</p>
                      </div>
                      <label class="wocs-toggle">
                        <input type="checkbox" data-integration="${item.id}" ${this.activeIntegrations[item.id]?.enabled ? 'checked' : ''}>
                        <span class="wocs-toggle-slider"></span>
                      </label>
                    </div>
                    <div class="wocs-integration-config" id="wocs-config-${item.id}" style="display: none">
                      ${this.renderConfigForm(item.id)}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
        
        <!-- AI Agent Configuration Modal -->
        <div class="wocs-ai-config" id="wocs-ai-config" style="display: none">
          <h3>🤖 AI Agent Configuration</h3>
          <div class="wocs-form-group">
            <label>System Prompt</label>
            <textarea id="wocs-ai-prompt" rows="4" placeholder="You are a helpful customer service agent for Abang Colek..."></textarea>
          </div>
          <div class="wocs-form-group">
            <label>Auto-Reply Triggers</label>
            <div class="wocs-checkbox-list">
              <label><input type="checkbox" id="wocs-ai-greet"> Auto-greet new chats</label>
              <label><input type="checkbox" id="wocs-ai-ooo"> Out of office replies</label>
              <label><input type="checkbox" id="wocs-ai-faq"> Answer FAQs automatically</label>
              <label><input type="checkbox" id="wocs-ai-order"> Order status queries</label>
            </div>
          </div>
          <div class="wocs-form-group">
            <label>Response Delay (seconds)</label>
            <input type="number" id="wocs-ai-delay" value="3" min="1" max="30">
          </div>
          <button class="wocs-btn wocs-btn-primary" id="wocs-save-ai-config">Save AI Config</button>
        </div>
        
        <!-- MCP Server Configuration -->
        <div class="wocs-mcp-config" id="wocs-mcp-config" style="display: none">
          <h3>🔌 MCP Server Configuration</h3>
          <div class="wocs-form-group">
            <label>Server URL</label>
            <input type="url" id="wocs-mcp-url" placeholder="http://localhost:3000">
          </div>
          <div class="wocs-form-group">
            <label>Transport</label>
            <select id="wocs-mcp-transport">
              <option value="stdio">stdio</option>
              <option value="sse">SSE</option>
              <option value="websocket">WebSocket</option>
            </select>
          </div>
          <div class="wocs-form-group">
            <label>Available Tools</label>
            <div class="wocs-mcp-tools" id="wocs-mcp-tools">
              <p class="wocs-empty">Connect to discover available tools</p>
            </div>
          </div>
          <button class="wocs-btn wocs-btn-primary" id="wocs-connect-mcp">Connect MCP Server</button>
        </div>
      </div>
    `;
  },

  renderConfigForm(integrationId) {
    // Different config forms based on integration type
    const configs = {
      // CRM configs
      hubspot: `
        <div class="wocs-form-group">
          <label>API Key</label>
          <input type="password" id="wocs-${integrationId}-key" placeholder="HubSpot API Key">
        </div>
        <button class="wocs-btn wocs-btn-primary" data-save="${integrationId}">Connect</button>
      `,
      airtable: `
        <div class="wocs-form-group">
          <label>API Key</label>
          <input type="password" id="wocs-${integrationId}-key" placeholder="Airtable API Key">
        </div>
        <div class="wocs-form-group">
          <label>Base ID</label>
          <input type="text" id="wocs-${integrationId}-base" placeholder="appXXXXXXXXXX">
        </div>
        <button class="wocs-btn wocs-btn-primary" data-save="${integrationId}">Connect</button>
      `,
      notion: `
        <div class="wocs-form-group">
          <label>Integration Token</label>
          <input type="password" id="wocs-${integrationId}-key" placeholder="secret_XXXXXXX">
        </div>
        <div class="wocs-form-group">
          <label>Database ID</label>
          <input type="text" id="wocs-${integrationId}-db" placeholder="Database ID">
        </div>
        <button class="wocs-btn wocs-btn-primary" data-save="${integrationId}">Connect</button>
      `,

      // AI configs
      openai: `
        <div class="wocs-form-group">
          <label>OpenAI API Key</label>
          <input type="password" id="wocs-${integrationId}-key" placeholder="sk-...">
        </div>
        <div class="wocs-form-group">
          <label>Model</label>
          <select id="wocs-${integrationId}-model">
            <option value="gpt-4o">GPT-4o (Recommended)</option>
            <option value="gpt-4o-mini">GPT-4o Mini</option>
            <option value="gpt-4-turbo">GPT-4 Turbo</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          </select>
        </div>
        <button class="wocs-btn" id="wocs-config-ai-${integrationId}">Configure Prompts</button>
        <button class="wocs-btn wocs-btn-primary" data-save="${integrationId}">Activate</button>
      `,
      claude: `
        <div class="wocs-form-group">
          <label>Anthropic API Key</label>
          <input type="password" id="wocs-${integrationId}-key" placeholder="sk-ant-...">
        </div>
        <div class="wocs-form-group">
          <label>Model</label>
          <select id="wocs-${integrationId}-model">
            <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
            <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
            <option value="claude-3-haiku-20240307">Claude 3 Haiku (Fast)</option>
          </select>
        </div>
        <button class="wocs-btn" id="wocs-config-ai-${integrationId}">Configure Prompts</button>
        <button class="wocs-btn wocs-btn-primary" data-save="${integrationId}">Activate</button>
      `,
      gemini: `
        <div class="wocs-form-group">
          <label>Google AI API Key</label>
          <input type="password" id="wocs-${integrationId}-key" placeholder="AIzaSy...">
        </div>
        <div class="wocs-form-group">
          <label>Model</label>
          <select id="wocs-${integrationId}-model">
            <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
            <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
          </select>
        </div>
        <button class="wocs-btn" id="wocs-config-ai-${integrationId}">Configure Prompts</button>
        <button class="wocs-btn wocs-btn-primary" data-save="${integrationId}">Activate</button>
      `,
      ollama: `
        <div class="wocs-form-group">
          <label>Ollama Server URL</label>
          <input type="url" id="wocs-${integrationId}-url" placeholder="http://localhost:11434" value="http://localhost:11434">
        </div>
        <div class="wocs-form-group">
          <label>Model</label>
          <select id="wocs-${integrationId}-model">
            <option value="llama3.2">Llama 3.2</option>
            <option value="mistral">Mistral</option>
            <option value="codellama">Code Llama</option>
            <option value="phi3">Phi-3</option>
          </select>
        </div>
        <button class="wocs-btn wocs-btn-primary" data-save="${integrationId}">Connect</button>
      `,
      'custom-agent': `
        <div class="wocs-form-group">
          <label>Agent Endpoint URL</label>
          <input type="url" id="wocs-${integrationId}-url" placeholder="https://your-agent.com/api">
        </div>
        <div class="wocs-form-group">
          <label>API Key (if required)</label>
          <input type="password" id="wocs-${integrationId}-key" placeholder="Optional API Key">
        </div>
        <div class="wocs-form-group">
          <label>Request Format</label>
          <select id="wocs-${integrationId}-format">
            <option value="openai">OpenAI Compatible</option>
            <option value="anthropic">Anthropic Compatible</option>
            <option value="custom">Custom JSON</option>
          </select>
        </div>
        <button class="wocs-btn wocs-btn-primary" data-save="${integrationId}">Connect</button>
      `,

      // MCP configs
      'mcp-supabase': `
        <div class="wocs-form-group">
          <label>Supabase URL</label>
          <input type="url" id="wocs-${integrationId}-url" placeholder="https://xxx.supabase.co">
        </div>
        <div class="wocs-form-group">
          <label>Supabase Key</label>
          <input type="password" id="wocs-${integrationId}-key" placeholder="Anon or Service Key">
        </div>
        <button class="wocs-btn wocs-btn-primary" data-save="${integrationId}">Connect</button>
      `,
      'mcp-github': `
        <div class="wocs-form-group">
          <label>GitHub Token</label>
          <input type="password" id="wocs-${integrationId}-key" placeholder="ghp_...">
        </div>
        <button class="wocs-btn wocs-btn-primary" data-save="${integrationId}">Connect</button>
      `,
      'mcp-custom': `
        <div class="wocs-form-group">
          <label>MCP Server Command</label>
          <input type="text" id="wocs-${integrationId}-cmd" placeholder="npx -y @your/mcp-server">
        </div>
        <div class="wocs-form-group">
          <label>Arguments (JSON)</label>
          <textarea id="wocs-${integrationId}-args" rows="2" placeholder='["--port", "3000"]'></textarea>
        </div>
        <button class="wocs-btn" id="wocs-config-mcp">Advanced Config</button>
        <button class="wocs-btn wocs-btn-primary" data-save="${integrationId}">Connect</button>
      `,

      // E-commerce
      shopify: `
        <div class="wocs-form-group">
          <label>Store URL</label>
          <input type="url" id="wocs-${integrationId}-url" placeholder="yourstore.myshopify.com">
        </div>
        <div class="wocs-form-group">
          <label>Access Token</label>
          <input type="password" id="wocs-${integrationId}-key" placeholder="shpat_...">
        </div>
        <button class="wocs-btn wocs-btn-primary" data-save="${integrationId}">Connect</button>
      `,
      shopee: `
        <div class="wocs-form-group">
          <label>Shop ID</label>
          <input type="text" id="wocs-${integrationId}-shop" placeholder="Your Shopee Shop ID">
        </div>
        <div class="wocs-form-group">
          <label>Partner ID</label>
          <input type="text" id="wocs-${integrationId}-partner" placeholder="Partner ID">
        </div>
        <div class="wocs-form-group">
          <label>Partner Key</label>
          <input type="password" id="wocs-${integrationId}-key" placeholder="Partner Key">
        </div>
        <button class="wocs-btn wocs-btn-primary" data-save="${integrationId}">Connect</button>
      `,

      // Automation
      zapier: `
        <div class="wocs-form-group">
          <label>Zapier Webhook URL</label>
          <input type="url" id="wocs-${integrationId}-url" placeholder="https://hooks.zapier.com/...">
        </div>
        <button class="wocs-btn" data-test="${integrationId}">Test Webhook</button>
        <button class="wocs-btn wocs-btn-primary" data-save="${integrationId}">Save</button>
      `,
      webhook: `
        <div class="wocs-form-group">
          <label>Webhook URL</label>
          <input type="url" id="wocs-${integrationId}-url" placeholder="https://your-server.com/webhook">
        </div>
        <div class="wocs-form-group">
          <label>Headers (JSON)</label>
          <textarea id="wocs-${integrationId}-headers" rows="2" placeholder='{"Authorization": "Bearer xxx"}'></textarea>
        </div>
        <div class="wocs-form-group">
          <label>Events to Send</label>
          <div class="wocs-checkbox-list">
            <label><input type="checkbox" value="new_message" checked> New Message</label>
            <label><input type="checkbox" value="new_contact"> New Contact</label>
            <label><input type="checkbox" value="broadcast_complete"> Broadcast Complete</label>
          </div>
        </div>
        <button class="wocs-btn" data-test="${integrationId}">Test Webhook</button>
        <button class="wocs-btn wocs-btn-primary" data-save="${integrationId}">Save</button>
      `,

      // Brand OS
      brandos: `
        <div class="wocs-form-group">
          <label>Brand OS URL</label>
          <input type="url" id="wocs-${integrationId}-url" placeholder="https://brand-os.vercel.app" value="https://brand-os.vercel.app">
        </div>
        <div class="wocs-form-group">
          <label>Supabase Project URL</label>
          <input type="url" id="wocs-${integrationId}-supabase" placeholder="https://xxx.supabase.co">
        </div>
        <div class="wocs-form-group">
          <label>Supabase Anon Key</label>
          <input type="password" id="wocs-${integrationId}-key" placeholder="eyJ...">
        </div>
        <div class="wocs-form-group">
          <label>Sync Options</label>
          <div class="wocs-checkbox-list">
            <label><input type="checkbox" value="contacts" checked> Sync Contacts</label>
            <label><input type="checkbox" value="templates" checked> Sync Templates</label>
            <label><input type="checkbox" value="broadcasts"> Sync Broadcast History</label>
            <label><input type="checkbox" value="analytics"> Push Analytics</label>
          </div>
        </div>
        <button class="wocs-btn wocs-btn-primary" data-save="${integrationId}">Connect to Brand OS</button>
      `
    };

    return configs[integrationId] || `
      <div class="wocs-form-group">
        <label>API Key / Token</label>
        <input type="password" id="wocs-${integrationId}-key" placeholder="Enter API Key">
      </div>
      <button class="wocs-btn wocs-btn-primary" data-save="${integrationId}">Connect</button>
    `;
  },

  init() {
    this.loadIntegrations();
    this.attachEventListeners();
  },

  attachEventListeners() {
    // Toggle integration cards
    document.querySelectorAll('[data-integration]').forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        const id = e.target.dataset.integration;
        const config = document.getElementById(`wocs-config-${id}`);
        if (config) config.style.display = e.target.checked ? 'block' : 'none';
      });
    });

    // Save buttons
    document.querySelectorAll('[data-save]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.save;
        this.saveIntegration(id);
      });
    });

    // Test webhook buttons
    document.querySelectorAll('[data-test]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.test;
        this.testWebhook(id);
      });
    });

    // Search
    document.getElementById('wocs-integration-search')?.addEventListener('input', (e) => {
      this.searchIntegrations(e.target.value);
    });

    // AI config buttons
    document.querySelectorAll('[id^="wocs-config-ai-"]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('wocs-ai-config').style.display = 'block';
      });
    });

    // MCP config button
    document.getElementById('wocs-config-mcp')?.addEventListener('click', () => {
      document.getElementById('wocs-mcp-config').style.display = 'block';
    });

    // Save AI config
    document.getElementById('wocs-save-ai-config')?.addEventListener('click', () => {
      this.saveAIConfig();
    });

    // Connect MCP server
    document.getElementById('wocs-connect-mcp')?.addEventListener('click', () => {
      this.connectMCPServer();
    });
  },

  loadIntegrations() {
    chrome.storage.local.get(['wocsIntegrations'], (result) => {
      if (result.wocsIntegrations) {
        this.activeIntegrations = result.wocsIntegrations;
      }
    });
  },

  saveIntegration(id) {
    const keyInput = document.getElementById(`wocs-${id}-key`);
    const urlInput = document.getElementById(`wocs-${id}-url`);
    const modelSelect = document.getElementById(`wocs-${id}-model`);

    this.activeIntegrations[id] = {
      enabled: true,
      key: keyInput?.value || '',
      url: urlInput?.value || '',
      model: modelSelect?.value || '',
      connectedAt: new Date().toISOString()
    };

    chrome.storage.local.set({ wocsIntegrations: this.activeIntegrations });
    this.showNotification(`✅ ${id} connected!`);
  },

  saveAIConfig() {
    const aiConfig = {
      prompt: document.getElementById('wocs-ai-prompt')?.value || '',
      autoGreet: document.getElementById('wocs-ai-greet')?.checked || false,
      outOfOffice: document.getElementById('wocs-ai-ooo')?.checked || false,
      answerFaq: document.getElementById('wocs-ai-faq')?.checked || false,
      orderStatus: document.getElementById('wocs-ai-order')?.checked || false,
      delay: parseInt(document.getElementById('wocs-ai-delay')?.value) || 3
    };

    chrome.storage.local.set({ wocsAIConfig: aiConfig });
    document.getElementById('wocs-ai-config').style.display = 'none';
    this.showNotification('🤖 AI Config saved!');
  },

  async connectMCPServer() {
    const url = document.getElementById('wocs-mcp-url')?.value;
    const transport = document.getElementById('wocs-mcp-transport')?.value;

    if (!url) {
      this.showNotification('❌ Please enter server URL');
      return;
    }

    // Try to connect and discover tools
    try {
      const response = await fetch(`${url}/mcp/tools`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const tools = await response.json();
        const toolsEl = document.getElementById('wocs-mcp-tools');
        if (toolsEl) {
          toolsEl.innerHTML = tools.map(t => `
            <div class="wocs-mcp-tool">
              <span class="wocs-tool-name">${t.name}</span>
              <span class="wocs-tool-desc">${t.description}</span>
            </div>
          `).join('');
        }
        this.showNotification('🔌 MCP Server connected!');
      }
    } catch (e) {
      this.showNotification('❌ Failed to connect: ' + e.message);
    }
  },

  testWebhook(id) {
    const urlInput = document.getElementById(`wocs-${id}-url`);
    const url = urlInput?.value;

    if (!url) {
      this.showNotification('❌ Please enter webhook URL');
      return;
    }

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'test',
        source: 'wocs-extension',
        timestamp: new Date().toISOString()
      })
    })
      .then(() => this.showNotification('✅ Webhook test successful!'))
      .catch(e => this.showNotification('❌ Webhook failed: ' + e.message));
  },

  searchIntegrations(query) {
    const lowerQuery = query.toLowerCase();
    const cards = document.querySelectorAll('.wocs-integration-card');

    cards.forEach(card => {
      const name = card.querySelector('h4')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
      const matches = name.includes(lowerQuery) || desc.includes(lowerQuery);
      card.style.display = matches ? '' : 'none';
    });

    // Hide empty categories
    document.querySelectorAll('.wocs-category').forEach(cat => {
      const visibleCards = cat.querySelectorAll('.wocs-integration-card[style=""]').length;
      cat.style.display = visibleCards > 0 || !query ? '' : 'none';
    });
  },

  showNotification(message) {
    const notif = document.createElement('div');
    notif.className = 'wocs-notification';
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
  }
};
