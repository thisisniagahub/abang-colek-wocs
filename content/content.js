// ==================================================
// WOCS - WhatsApp Operations Command System
// Main Content Script - REAL DATA INTEGRATION
// ==================================================

(function () {
    'use strict';

    console.log('[WOCS] 🌶️ Abang Colek WOCS Extension loading...');

    // Global state
    window.WOCS = {
        isReady: false,
        currentPanel: null,
        contacts: [],
        stats: {}
    };

    // IMMEDIATELY setup message listener
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('[WOCS] Message received:', request.action);

        switch (request.action) {
            case 'ping':
                sendResponse({ pong: true, ready: window.WOCS.isReady });
                break;
            case 'extractContacts':
                const contacts = extractContacts();
                sendResponse({ contacts: contacts });
                break;
            case 'insertTemplate':
                const success = insertTemplate(request.template);
                sendResponse({ success: success });
                break;
            case 'getStats':
                sendResponse({ stats: getStats() });
                break;
            case 'showLabels':
                showNotification('Labels - Coming Soon!');
                sendResponse({ success: true });
                break;
            default:
                sendResponse({ received: request.action });
        }
        return true;
    });

    console.log('[WOCS] ✅ Message listener ready');

    // ===========================================
    // REAL DATA FUNCTIONS
    // ===========================================

    // Extract REAL contacts from WhatsApp chat list
    function extractContacts() {
        const contacts = [];
        const chatItems = document.querySelectorAll('[data-testid="cell-frame-container"]');

        console.log('[WOCS] Extracting from', chatItems.length, 'chat items');

        chatItems.forEach((item, index) => {
            try {
                const nameEl = item.querySelector('[data-testid="cell-frame-title"] span');
                const lastMsgEl = item.querySelector('[data-testid="last-msg-status"]');
                const timeEl = item.querySelector('[data-testid="cell-frame-secondary"]');
                const unreadEl = item.querySelector('[data-testid="icon-unread-count"]');
                const muteIcon = item.querySelector('[data-icon="muted"]');
                const pinIcon = item.querySelector('[data-icon="pinned2"]');

                // Check if group
                const groupIcon = item.querySelector('[data-icon="default-group"]');
                const isGroup = !!groupIcon;

                if (nameEl) {
                    const name = nameEl.textContent.trim();
                    // Check if it's a phone number (unsaved contact)
                    const isPhoneNumber = /^\+?\d[\d\s\-()]+$/.test(name);

                    contacts.push({
                        id: index,
                        name: name,
                        number: isPhoneNumber ? name.replace(/[\s\-()]/g, '') : '',
                        isGroup: isGroup,
                        isSaved: !isPhoneNumber && !isGroup,
                        lastMessage: lastMsgEl?.textContent?.trim() || '',
                        time: timeEl?.textContent?.trim() || '',
                        unread: unreadEl ? parseInt(unreadEl.textContent) || 1 : 0,
                        isMuted: !!muteIcon,
                        isPinned: !!pinIcon,
                        timestamp: new Date().toISOString()
                    });
                }
            } catch (e) {
                console.error('[WOCS] Error extracting contact:', e);
            }
        });

        // Save to storage
        chrome.storage.local.set({ wocsContacts: contacts });
        window.WOCS.contacts = contacts;

        console.log('[WOCS] Extracted', contacts.length, 'contacts');
        return contacts;
    }

    // Get REAL statistics from WhatsApp
    function getStats() {
        const chatItems = document.querySelectorAll('[data-testid="cell-frame-container"]');

        const stats = {
            totalChats: chatItems.length,
            groups: 0,
            contacts: 0,
            unread: 0,
            saved: 0,
            unsaved: 0,
            muted: 0,
            pinned: 0
        };

        chatItems.forEach(item => {
            const isGroup = !!item.querySelector('[data-icon="default-group"]');
            const isUnread = !!item.querySelector('[data-testid="icon-unread-count"]');
            const isMuted = !!item.querySelector('[data-icon="muted"]');
            const isPinned = !!item.querySelector('[data-icon="pinned2"]');
            const nameEl = item.querySelector('[data-testid="cell-frame-title"] span');

            if (isGroup) stats.groups++;
            else stats.contacts++;

            if (isUnread) stats.unread++;
            if (isMuted) stats.muted++;
            if (isPinned) stats.pinned++;

            if (nameEl) {
                const name = nameEl.textContent.trim();
                const isPhoneNumber = /^\+?\d[\d\s\-()]+$/.test(name);
                if (!isGroup && !isPhoneNumber) stats.saved++;
                if (!isGroup && isPhoneNumber) stats.unsaved++;
            }
        });

        window.WOCS.stats = stats;
        return stats;
    }

    // Insert template into current chat
    function insertTemplate(template) {
        const input = document.querySelector('[data-testid="conversation-compose-box-input"]');
        if (input) {
            input.focus();
            // Use modern approach
            const dataTransfer = new DataTransfer();
            dataTransfer.setData('text/plain', template);
            const pasteEvent = new ClipboardEvent('paste', {
                bubbles: true,
                cancelable: true,
                clipboardData: dataTransfer
            });
            input.dispatchEvent(pasteEvent);

            // Fallback
            if (!input.textContent.includes(template)) {
                document.execCommand('insertText', false, template);
            }

            showNotification('✅ Template inserted!');
            return true;
        } else {
            showNotification('⚠️ Open a chat first!');
            return false;
        }
    }

    // Show notification
    function showNotification(message) {
        document.querySelectorAll('.wocs-notification').forEach(n => n.remove());

        const notif = document.createElement('div');
        notif.className = 'wocs-notification';
        notif.innerHTML = message;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    }

    // AI API Helper
    async function callAI(config, prompt) {
        const { provider, apiKey } = config;

        if (provider === 'openai') {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 150
                })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            return data.choices[0].message.content;
        }
        else if (provider === 'claude') {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 150,
                    messages: [{ role: 'user', content: prompt }]
                })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            return data.content[0].text;
        }
        else if (provider === 'gemini') {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            return data.candidates[0].content.parts[0].text;
        }

        throw new Error('Unknown provider');
    }

    // ===========================================
    // UI INJECTION
    // ===========================================

    // Create and inject sidebar
    function injectSidebar() {
        if (document.getElementById('wocs-sidebar')) return;

        const sidebar = document.createElement('div');
        sidebar.id = 'wocs-sidebar';
        sidebar.className = 'wocs-sidebar';
        sidebar.innerHTML = `
            <div class="wocs-sidebar-icons">
                <button class="wocs-sidebar-btn" data-panel="analytics" title="Analytics (Alt+1)">📊</button>
                <button class="wocs-sidebar-btn" data-panel="broadcasts" title="Broadcasts (Alt+2)">📢</button>
                <button class="wocs-sidebar-btn" data-panel="templates" title="Templates (Alt+3)">📝</button>
                <button class="wocs-sidebar-btn" data-panel="audience" title="Audience (Alt+4)">👥</button>
                <button class="wocs-sidebar-btn" data-panel="tools" title="Tools (Alt+5)">🛠️</button>
                <button class="wocs-sidebar-btn" data-panel="export" title="Export (Alt+6)">📤</button>
                <button class="wocs-sidebar-btn" data-panel="devconsole" title="Dev Console (Alt+7)">🔧</button>
                <button class="wocs-sidebar-btn" data-panel="aiengine" title="AI Engine (Alt+8)">🤖</button>
                <button class="wocs-sidebar-btn" data-panel="mcpbridge" title="MCP Bridge (Alt+9)">🔌</button>
                <button class="wocs-sidebar-btn" data-panel="settings" title="Settings">⚙️</button>
            </div>
            <div class="wocs-sidebar-footer">
                <button class="wocs-sidebar-btn wocs-upgrade" title="Upgrade">⭐</button>
            </div>
        `;
        document.body.appendChild(sidebar);

        // Add click handlers
        sidebar.querySelectorAll('.wocs-sidebar-btn[data-panel]').forEach(btn => {
            btn.addEventListener('click', () => {
                const panel = btn.dataset.panel;
                togglePanel(panel);

                // Update active state
                sidebar.querySelectorAll('.wocs-sidebar-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        console.log('[WOCS] Sidebar injected');
    }

    // Create and inject top navigation
    function injectTopNav() {
        if (document.getElementById('wocs-topnav')) return;

        const stats = getStats();

        const topnav = document.createElement('div');
        topnav.id = 'wocs-topnav';
        topnav.className = 'wocs-topnav';
        topnav.innerHTML = `
            <div class="wocs-topnav-tabs">
                <button class="wocs-topnav-tab active" data-filter="all">
                    <span class="wocs-tab-icon">📥</span>
                    <span>Inbox</span>
                    <span class="wocs-tab-count">${stats.totalChats}</span>
                </button>
                <button class="wocs-topnav-tab" data-filter="unread">
                    <span class="wocs-tab-icon">🔔</span>
                    <span>Unread</span>
                    <span class="wocs-tab-count">${stats.unread}</span>
                </button>
                <button class="wocs-topnav-tab" data-filter="groups">
                    <span class="wocs-tab-icon">👥</span>
                    <span>Groups</span>
                    <span class="wocs-tab-count">${stats.groups}</span>
                </button>
                <button class="wocs-topnav-tab" data-filter="contacts">
                    <span class="wocs-tab-icon">👤</span>
                    <span>Contacts</span>
                    <span class="wocs-tab-count">${stats.contacts}</span>
                </button>
                <button class="wocs-topnav-tab" data-filter="unsaved">
                    <span class="wocs-tab-icon">📱</span>
                    <span>Unsaved</span>
                    <span class="wocs-tab-count">${stats.unsaved}</span>
                </button>
            </div>
            <div class="wocs-topnav-actions">
                <button class="wocs-settings-btn" title="Settings">⚙️</button>
                <button class="wocs-upgrade-btn">⭐ Upgrade</button>
            </div>
        `;
        document.body.appendChild(topnav);

        // Add filter handlers
        topnav.querySelectorAll('.wocs-topnav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const filter = tab.dataset.filter;
                filterChats(filter);

                topnav.querySelectorAll('.wocs-topnav-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });

        console.log('[WOCS] TopNav injected');
    }

    // Create panel container
    function injectPanelContainer() {
        if (document.getElementById('wocs-panel-container')) return;

        const container = document.createElement('div');
        container.id = 'wocs-panel-container';
        container.className = 'wocs-panel-container';
        container.innerHTML = `
            <div class="wocs-panel-header">
                <h3 class="wocs-panel-title">Panel</h3>
                <button class="wocs-panel-close">✕</button>
            </div>
            <div class="wocs-panel-content"></div>
        `;
        document.body.appendChild(container);

        container.querySelector('.wocs-panel-close').addEventListener('click', () => {
            container.classList.remove('open');
            window.WOCS.currentPanel = null;
            document.querySelectorAll('.wocs-sidebar-btn').forEach(b => b.classList.remove('active'));
        });

        console.log('[WOCS] Panel container injected');
    }

    // Filter chats based on criteria
    function filterChats(filter) {
        const chatItems = document.querySelectorAll('[data-testid="cell-frame-container"]');

        chatItems.forEach(item => {
            const isGroup = !!item.querySelector('[data-icon="default-group"]');
            const isUnread = !!item.querySelector('[data-testid="icon-unread-count"]');
            const nameEl = item.querySelector('[data-testid="cell-frame-title"] span');
            const name = nameEl?.textContent?.trim() || '';
            const isPhoneNumber = /^\+?\d[\d\s\-()]+$/.test(name);

            let show = true;

            switch (filter) {
                case 'unread':
                    show = isUnread;
                    break;
                case 'groups':
                    show = isGroup;
                    break;
                case 'contacts':
                    show = !isGroup;
                    break;
                case 'unsaved':
                    show = !isGroup && isPhoneNumber;
                    break;
                case 'all':
                default:
                    show = true;
            }

            // Find parent row and toggle visibility
            const row = item.closest('[data-testid="chat-list"] > div > div');
            if (row) {
                row.style.display = show ? '' : 'none';
            }
        });

        showNotification(`Filtered: ${filter}`);
    }

    // Toggle panel visibility
    function togglePanel(panelId) {
        const container = document.getElementById('wocs-panel-container');
        const title = container.querySelector('.wocs-panel-title');
        const content = container.querySelector('.wocs-panel-content');

        if (window.WOCS.currentPanel === panelId) {
            container.classList.remove('open');
            window.WOCS.currentPanel = null;
            return;
        }

        window.WOCS.currentPanel = panelId;
        container.classList.add('open');

        // Render panel content with REAL data
        const panelContent = renderPanel(panelId);
        title.textContent = panelContent.title;
        content.innerHTML = panelContent.html;

        // Attach panel-specific event listeners
        attachPanelListeners(panelId);
    }

    // Render panel with REAL data
    function renderPanel(panelId) {
        const stats = getStats();
        const contacts = extractContacts();

        switch (panelId) {
            case 'analytics':
                return {
                    title: '📊 Analytics',
                    html: `
                        <div class="wocs-analytics">
                            <div class="wocs-stats-row">
                                <div class="wocs-stat-card">
                                    <h4>Total Chats</h4>
                                    <div class="wocs-stat-value">${stats.totalChats}</div>
                                </div>
                                <div class="wocs-stat-card">
                                    <h4>Unread</h4>
                                    <div class="wocs-stat-value">${stats.unread}</div>
                                </div>
                            </div>
                            <div class="wocs-stats-row">
                                <div class="wocs-stat-card">
                                    <h4>Groups</h4>
                                    <div class="wocs-stat-value">${stats.groups}</div>
                                </div>
                                <div class="wocs-stat-card">
                                    <h4>Contacts</h4>
                                    <div class="wocs-stat-value">${stats.contacts}</div>
                                </div>
                            </div>
                            <div class="wocs-stats-row">
                                <div class="wocs-stat-card">
                                    <h4>Saved</h4>
                                    <div class="wocs-stat-value">${stats.saved}</div>
                                </div>
                                <div class="wocs-stat-card">
                                    <h4>Unsaved</h4>
                                    <div class="wocs-stat-value">${stats.unsaved}</div>
                                </div>
                            </div>
                            <button class="wocs-btn wocs-btn-primary" id="wocs-refresh-stats">🔄 Refresh Stats</button>
                        </div>
                    `
                };

            case 'templates':
                return {
                    title: '📝 Quick Templates',
                    html: `
                        <div class="wocs-templates">
                            <div class="wocs-template-list">
                                <div class="wocs-template-item" data-template="order">
                                    <span>🛒 Order Confirmation</span>
                                    <button class="wocs-btn-sm">Use</button>
                                </div>
                                <div class="wocs-template-item" data-template="reminder">
                                    <span>⏰ Event Reminder</span>
                                    <button class="wocs-btn-sm">Use</button>
                                </div>
                                <div class="wocs-template-item" data-template="thanks">
                                    <span>🙏 Thank You</span>
                                    <button class="wocs-btn-sm">Use</button>
                                </div>
                                <div class="wocs-template-item" data-template="promo">
                                    <span>🔥 Promo Blast</span>
                                    <button class="wocs-btn-sm">Use</button>
                                </div>
                            </div>
                            <hr>
                            <h4>Custom Template</h4>
                            <textarea id="wocs-custom-template" rows="4" placeholder="Type your message..."></textarea>
                            <button class="wocs-btn wocs-btn-primary" id="wocs-send-custom">📤 Insert</button>
                        </div>
                    `
                };

            case 'export':
                return {
                    title: '📤 Export Contacts',
                    html: `
                        <div class="wocs-export">
                            <p>Found <strong>${contacts.length}</strong> contacts</p>
                            <div class="wocs-export-filters">
                                <label><input type="checkbox" id="wocs-export-groups" checked> Include Groups</label>
                                <label><input type="checkbox" id="wocs-export-saved" checked> Include Saved</label>
                                <label><input type="checkbox" id="wocs-export-unsaved" checked> Include Unsaved</label>
                            </div>
                            <div class="wocs-preview-table">
                                <table>
                                    <thead>
                                        <tr><th>Name</th><th>Number</th><th>Type</th></tr>
                                    </thead>
                                    <tbody>
                                        ${contacts.slice(0, 5).map(c => `
                                            <tr>
                                                <td>${c.name}</td>
                                                <td>${c.number || '-'}</td>
                                                <td>${c.isGroup ? 'Group' : c.isSaved ? 'Saved' : 'Unsaved'}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                                ${contacts.length > 5 ? `<p class="wocs-more">...and ${contacts.length - 5} more</p>` : ''}
                            </div>
                            <button class="wocs-btn wocs-btn-primary" id="wocs-export-csv">📥 Download CSV</button>
                        </div>
                    `
                };

            case 'broadcasts':
                return {
                    title: '📢 Broadcast',
                    html: `
                        <div class="wocs-broadcasts">
                            <p>Send message to multiple contacts</p>
                            <div class="wocs-form-group">
                                <label>Message</label>
                                <textarea id="wocs-broadcast-msg" rows="4" placeholder="Your broadcast message..."></textarea>
                            </div>
                            <div class="wocs-form-group">
                                <label>Delay between messages (seconds)</label>
                                <input type="number" id="wocs-broadcast-delay" value="5" min="3" max="30">
                            </div>
                            <p>📋 Contacts found: <strong>${contacts.filter(c => !c.isGroup && c.number).length}</strong></p>
                            <button class="wocs-btn wocs-btn-primary" id="wocs-start-broadcast">🚀 Start Broadcast</button>
                            <p class="wocs-note">⚠️ WhatsApp may block if you send too fast</p>
                        </div>
                    `
                };

            case 'audience':
                const saved = contacts.filter(c => c.isSaved && !c.isGroup);
                const unsaved = contacts.filter(c => !c.isSaved && !c.isGroup);
                const groups = contacts.filter(c => c.isGroup);
                return {
                    title: '👥 Audience',
                    html: `
                        <div class="wocs-audience">
                            <div class="wocs-audience-stats">
                                <div class="wocs-stat-card"><h4>Saved Contacts</h4><div class="wocs-stat-value">${saved.length}</div></div>
                                <div class="wocs-stat-card"><h4>Unsaved</h4><div class="wocs-stat-value">${unsaved.length}</div></div>
                                <div class="wocs-stat-card"><h4>Groups</h4><div class="wocs-stat-value">${groups.length}</div></div>
                            </div>
                            <h4>Recent Contacts</h4>
                            <div class="wocs-contact-list">
                                ${contacts.slice(0, 10).map(c => `
                                    <div class="wocs-contact-chip">${c.name} ${c.isGroup ? '👥' : ''}</div>
                                `).join('')}
                            </div>
                        </div>
                    `
                };

            case 'tools':
                return {
                    title: '🛠️ Tools',
                    html: `
                        <div class="wocs-tools">
                            <div class="wocs-tool-card">
                                <h4>🔗 wa.me Link Generator</h4>
                                <input type="text" id="wocs-link-phone" placeholder="Phone number (e.g., 60123456789)">
                                <input type="text" id="wocs-link-msg" placeholder="Pre-filled message (optional)">
                                <button class="wocs-btn wocs-btn-primary" id="wocs-gen-link">Generate Link</button>
                                <input type="text" id="wocs-link-result" readonly placeholder="Generated link will appear here">
                                <button class="wocs-btn" id="wocs-copy-link">📋 Copy</button>
                            </div>
                        </div>
                    `
                };

            case 'settings':
                return {
                    title: '⚙️ Settings',
                    html: `
                        <div class="wocs-settings">
                            <div class="wocs-settings-section">
                                <h4>🔒 Privacy</h4>
                                <label class="wocs-setting-item">
                                    <input type="checkbox" id="wocs-blur-names"> Blur Contact Names
                                </label>
                                <label class="wocs-setting-item">
                                    <input type="checkbox" id="wocs-blur-photos"> Blur Profile Photos
                                </label>
                            </div>
                            <button class="wocs-btn wocs-btn-primary" id="wocs-save-settings">💾 Save Settings</button>
                        </div>
                    `
                };

            case 'devconsole':
                return {
                    title: '🔧 Developer Console',
                    html: `
                        <div class="wocs-devconsole">
                            <div class="wocs-dev-tabs">
                                <button class="wocs-dev-tab active" data-devtab="dom">DOM</button>
                                <button class="wocs-dev-tab" data-devtab="events">Events</button>
                                <button class="wocs-dev-tab" data-devtab="console">Console</button>
                                <button class="wocs-dev-tab" data-devtab="state">State</button>
                            </div>
                            
                            <div class="wocs-dev-content" id="wocs-dev-dom">
                                <h4>🔍 DOM Explorer</h4>
                                <p>Click any element on WhatsApp to inspect</p>
                                <button class="wocs-btn wocs-btn-primary" id="wocs-dom-picker">🎯 Pick Element</button>
                                <div class="wocs-code-block" id="wocs-dom-output">
                                    <pre>// Element info will appear here</pre>
                                </div>
                                <h4>Quick Selectors</h4>
                                <div class="wocs-selector-list">
                                    <button class="wocs-btn-sm" data-selector="chat-list">Chat List</button>
                                    <button class="wocs-btn-sm" data-selector="message-input">Message Input</button>
                                    <button class="wocs-btn-sm" data-selector="contact-info">Contact Info</button>
                                </div>
                            </div>
                            
                            <div class="wocs-dev-content hidden" id="wocs-dev-events">
                                <h4>📡 Event Logger</h4>
                                <div class="wocs-event-controls">
                                    <button class="wocs-btn wocs-btn-primary" id="wocs-start-logging">▶️ Start</button>
                                    <button class="wocs-btn" id="wocs-clear-events">🗑️ Clear</button>
                                </div>
                                <div class="wocs-event-log" id="wocs-event-log">
                                    <div class="wocs-event-item">Ready to capture events...</div>
                                </div>
                            </div>
                            
                            <div class="wocs-dev-content hidden" id="wocs-dev-console">
                                <h4>💻 JavaScript Console</h4>
                                <textarea id="wocs-js-input" rows="5" placeholder="// Enter JavaScript code here
// Example: document.querySelectorAll('[data-testid]').length"></textarea>
                                <button class="wocs-btn wocs-btn-primary" id="wocs-run-js">▶️ Execute</button>
                                <div class="wocs-code-block" id="wocs-js-output">
                                    <pre>// Output will appear here</pre>
                                </div>
                            </div>
                            
                            <div class="wocs-dev-content hidden" id="wocs-dev-state">
                                <h4>📊 WhatsApp State</h4>
                                <button class="wocs-btn wocs-btn-primary" id="wocs-dump-state">📥 Dump State</button>
                                <div class="wocs-code-block" id="wocs-state-output">
                                    <pre>// State dump will appear here</pre>
                                </div>
                            </div>
                        </div>
                    `
                };

            case 'aiengine':
                return {
                    title: '🤖 AI Engine',
                    html: `
                        <div class="wocs-aiengine">
                            <div class="wocs-ai-config">
                                <h4>🔑 API Configuration</h4>
                                <div class="wocs-form-group">
                                    <label>Provider</label>
                                    <select id="wocs-ai-provider">
                                        <option value="openai">OpenAI (GPT-4o)</option>
                                        <option value="claude">Claude (Sonnet 4)</option>
                                        <option value="gemini">Google Gemini</option>
                                    </select>
                                </div>
                                <div class="wocs-form-group">
                                    <label>API Key</label>
                                    <input type="password" id="wocs-ai-key" placeholder="Enter your API key">
                                </div>
                                <button class="wocs-btn" id="wocs-save-ai-config">💾 Save Config</button>
                            </div>
                            
                            <hr>
                            
                            <div class="wocs-ai-tools">
                                <h4>🚀 AI Tools</h4>
                                
                                <div class="wocs-tool-card">
                                    <h5>💬 Smart Reply</h5>
                                    <p>Generate contextual reply for current chat</p>
                                    <textarea id="wocs-ai-context" rows="3" placeholder="Paste the message you want to reply to..."></textarea>
                                    <select id="wocs-ai-tone">
                                        <option value="professional">Professional</option>
                                        <option value="friendly">Friendly</option>
                                        <option value="casual">Casual</option>
                                        <option value="formal">Formal</option>
                                    </select>
                                    <button class="wocs-btn wocs-btn-primary" id="wocs-generate-reply">✨ Generate Reply</button>
                                    <div class="wocs-ai-result" id="wocs-reply-result"></div>
                                </div>
                                
                                <div class="wocs-tool-card">
                                    <h5>🌐 Translator</h5>
                                    <input type="text" id="wocs-translate-text" placeholder="Text to translate">
                                    <select id="wocs-translate-lang">
                                        <option value="ms">Malay</option>
                                        <option value="en">English</option>
                                        <option value="zh">Chinese</option>
                                        <option value="ta">Tamil</option>
                                        <option value="ar">Arabic</option>
                                    </select>
                                    <button class="wocs-btn" id="wocs-translate">🌐 Translate</button>
                                    <div class="wocs-ai-result" id="wocs-translate-result"></div>
                                </div>
                                
                                <div class="wocs-tool-card">
                                    <h5>😊 Sentiment Analysis</h5>
                                    <textarea id="wocs-sentiment-text" rows="2" placeholder="Paste message to analyze"></textarea>
                                    <button class="wocs-btn" id="wocs-analyze-sentiment">🔍 Analyze</button>
                                    <div class="wocs-ai-result" id="wocs-sentiment-result"></div>
                                </div>
                            </div>
                        </div>
                    `
                };

            case 'mcpbridge':
                return {
                    title: '🔌 MCP Bridge',
                    html: `
                        <div class="wocs-mcpbridge">
                            <div class="wocs-mcp-config">
                                <h4>🔌 Server Connection</h4>
                                <div class="wocs-form-group">
                                    <label>MCP Server URL</label>
                                    <input type="text" id="wocs-mcp-url" placeholder="http://localhost:3000 or wss://...">
                                </div>
                                <div class="wocs-form-group">
                                    <label>Transport</label>
                                    <select id="wocs-mcp-transport">
                                        <option value="stdio">stdio</option>
                                        <option value="sse">SSE (Server-Sent Events)</option>
                                        <option value="websocket">WebSocket</option>
                                    </select>
                                </div>
                                <div class="wocs-connection-status" id="wocs-mcp-status">
                                    <span class="wocs-status-dot disconnected"></span>
                                    <span>Disconnected</span>
                                </div>
                                <button class="wocs-btn wocs-btn-primary" id="wocs-mcp-connect">🔌 Connect</button>
                            </div>
                            
                            <hr>
                            
                            <div class="wocs-mcp-tools">
                                <h4>🛠️ Available Tools</h4>
                                <button class="wocs-btn" id="wocs-discover-tools">🔍 Discover Tools</button>
                                <div class="wocs-tool-list" id="wocs-mcp-toollist">
                                    <div class="wocs-empty">Connect to server to discover tools</div>
                                </div>
                            </div>
                            
                            <hr>
                            
                            <div class="wocs-mcp-executor">
                                <h4>⚡ Tool Executor</h4>
                                <div class="wocs-form-group">
                                    <label>Tool Name</label>
                                    <input type="text" id="wocs-mcp-toolname" placeholder="e.g., execute_sql">
                                </div>
                                <div class="wocs-form-group">
                                    <label>Parameters (JSON)</label>
                                    <textarea id="wocs-mcp-params" rows="4" placeholder='{"query": "SELECT * FROM users"}'></textarea>
                                </div>
                                <button class="wocs-btn wocs-btn-primary" id="wocs-execute-tool">▶️ Execute</button>
                                <div class="wocs-code-block" id="wocs-mcp-result">
                                    <pre>// Tool result will appear here</pre>
                                </div>
                            </div>
                            
                            <hr>
                            
                            <div class="wocs-mcp-presets">
                                <h4>📦 Preset Servers</h4>
                                <button class="wocs-btn-sm" data-mcp="supabase">Supabase</button>
                                <button class="wocs-btn-sm" data-mcp="github">GitHub</button>
                                <button class="wocs-btn-sm" data-mcp="prisma">Prisma</button>
                                <button class="wocs-btn-sm" data-mcp="sequential">Sequential Thinking</button>
                            </div>
                        </div>
                    `
                };

            default:
                return { title: 'Panel', html: '<p>Coming soon...</p>' };
        }
    }

    // Attach event listeners to panel elements
    function attachPanelListeners(panelId) {
        switch (panelId) {
            case 'analytics':
                document.getElementById('wocs-refresh-stats')?.addEventListener('click', () => {
                    togglePanel('analytics');
                    showNotification('Stats refreshed!');
                });
                break;

            case 'templates':
                // Preset templates
                document.querySelectorAll('.wocs-template-item').forEach(item => {
                    item.querySelector('button')?.addEventListener('click', () => {
                        const templateType = item.dataset.template;
                        const templates = {
                            order: '🌶️ *ABANG COLEK*\n\nTerima kasih atas pembelian anda!\n\n✅ Order confirmed\n📦 Akan dihantar segera\n\nJumpa lagi! 🔥',
                            reminder: '🌶️ *REMINDER*\n\nJangan lupa event kami!\n\n📅 [DATE]\n📍 [LOCATION]\n\nSee you! 🔥',
                            thanks: '🙏 Terima kasih support Abang Colek!\n\nKami appreciate sangat ❤️\n\n🌶️🔥',
                            promo: '🔥 *PROMO SPECIAL!* 🔥\n\nAbang Colek ada special deal!\n\n[DETAILS]\n\nJangan lepaskan! 🌶️'
                        };
                        insertTemplate(templates[templateType]);
                    });
                });

                // Custom template
                document.getElementById('wocs-send-custom')?.addEventListener('click', () => {
                    const text = document.getElementById('wocs-custom-template')?.value;
                    if (text) insertTemplate(text);
                });
                break;

            case 'export':
                document.getElementById('wocs-export-csv')?.addEventListener('click', () => {
                    const contacts = extractContacts();
                    const includeGroups = document.getElementById('wocs-export-groups')?.checked;
                    const includeSaved = document.getElementById('wocs-export-saved')?.checked;
                    const includeUnsaved = document.getElementById('wocs-export-unsaved')?.checked;

                    const filtered = contacts.filter(c => {
                        if (c.isGroup && !includeGroups) return false;
                        if (c.isSaved && !includeSaved) return false;
                        if (!c.isSaved && !c.isGroup && !includeUnsaved) return false;
                        return true;
                    });

                    const csv = 'Name,Number,Type,Last Message,Time\n' +
                        filtered.map(c =>
                            `"${c.name}","${c.number}","${c.isGroup ? 'Group' : c.isSaved ? 'Saved' : 'Unsaved'}","${c.lastMessage}","${c.time}"`
                        ).join('\n');

                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `wocs-export-${Date.now()}.csv`;
                    a.click();

                    showNotification(`✅ Exported ${filtered.length} contacts!`);
                });
                break;

            case 'tools':
                document.getElementById('wocs-gen-link')?.addEventListener('click', () => {
                    const phone = document.getElementById('wocs-link-phone')?.value.replace(/\D/g, '');
                    const msg = document.getElementById('wocs-link-msg')?.value;

                    if (!phone) {
                        showNotification('Enter phone number!');
                        return;
                    }

                    let link = `https://wa.me/${phone}`;
                    if (msg) link += `?text=${encodeURIComponent(msg)}`;

                    document.getElementById('wocs-link-result').value = link;
                });

                document.getElementById('wocs-copy-link')?.addEventListener('click', () => {
                    const link = document.getElementById('wocs-link-result')?.value;
                    if (link) {
                        navigator.clipboard.writeText(link);
                        showNotification('✅ Link copied!');
                    }
                });
                break;

            case 'settings':
                document.getElementById('wocs-save-settings')?.addEventListener('click', () => {
                    const settings = {
                        privacy: {
                            blurContactNames: document.getElementById('wocs-blur-names')?.checked,
                            blurContactPhotos: document.getElementById('wocs-blur-photos')?.checked
                        }
                    };
                    chrome.storage.local.set({ wocsSettings: settings });
                    applySettings(settings);
                    showNotification('✅ Settings saved!');
                });
                break;

            case 'broadcasts':
                document.getElementById('wocs-start-broadcast')?.addEventListener('click', () => {
                    showNotification('⚠️ Broadcast requires Premium!');
                });
                break;

            case 'devconsole':
                // Tab switching
                document.querySelectorAll('.wocs-dev-tab').forEach(tab => {
                    tab.addEventListener('click', () => {
                        document.querySelectorAll('.wocs-dev-tab').forEach(t => t.classList.remove('active'));
                        document.querySelectorAll('.wocs-dev-content').forEach(c => c.classList.add('hidden'));
                        tab.classList.add('active');
                        document.getElementById(`wocs-dev-${tab.dataset.devtab}`)?.classList.remove('hidden');
                    });
                });

                // DOM Picker
                document.getElementById('wocs-dom-picker')?.addEventListener('click', () => {
                    showNotification('Click any element to inspect');
                    const handler = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const el = e.target;
                        const info = {
                            tag: el.tagName,
                            id: el.id,
                            classes: el.className,
                            testId: el.getAttribute('data-testid'),
                            text: el.textContent?.substring(0, 100),
                            rect: el.getBoundingClientRect()
                        };
                        document.getElementById('wocs-dom-output').innerHTML =
                            `<pre>${JSON.stringify(info, null, 2)}</pre>`;
                        document.removeEventListener('click', handler, true);
                        showNotification('Element inspected!');
                    };
                    document.addEventListener('click', handler, true);
                });

                // Quick selectors
                document.querySelectorAll('[data-selector]').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const selectors = {
                            'chat-list': '[data-testid="chat-list"]',
                            'message-input': '[data-testid="conversation-compose-box-input"]',
                            'contact-info': '[data-testid="contact-info-drawer"]'
                        };
                        const el = document.querySelector(selectors[btn.dataset.selector]);
                        document.getElementById('wocs-dom-output').innerHTML =
                            `<pre>Found: ${el ? 'Yes' : 'No'}\nSelector: ${selectors[btn.dataset.selector]}</pre>`;
                    });
                });

                // Event Logger
                let isLogging = false;
                let eventLog = [];
                document.getElementById('wocs-start-logging')?.addEventListener('click', function () {
                    isLogging = !isLogging;
                    this.textContent = isLogging ? '⏹️ Stop' : '▶️ Start';
                    if (isLogging) {
                        const logEl = document.getElementById('wocs-event-log');
                        const logEvent = (type) => (e) => {
                            if (!isLogging) return;
                            eventLog.push({ type, target: e.target.tagName, time: Date.now() });
                            logEl.innerHTML = eventLog.slice(-10).map(ev =>
                                `<div class="wocs-event-item">[${ev.type}] ${ev.target}</div>`
                            ).join('');
                        };
                        ['click', 'keydown', 'scroll'].forEach(t => document.addEventListener(t, logEvent(t)));
                    }
                });

                document.getElementById('wocs-clear-events')?.addEventListener('click', () => {
                    eventLog = [];
                    document.getElementById('wocs-event-log').innerHTML = '<div class="wocs-event-item">Cleared</div>';
                });

                // JS Console
                document.getElementById('wocs-run-js')?.addEventListener('click', () => {
                    const code = document.getElementById('wocs-js-input')?.value;
                    try {
                        const result = eval(code);
                        document.getElementById('wocs-js-output').innerHTML =
                            `<pre>${JSON.stringify(result, null, 2) || result}</pre>`;
                    } catch (e) {
                        document.getElementById('wocs-js-output').innerHTML =
                            `<pre style="color: #ef4444;">Error: ${e.message}</pre>`;
                    }
                });

                // State Dump
                document.getElementById('wocs-dump-state')?.addEventListener('click', () => {
                    const state = {
                        chats: document.querySelectorAll('[data-testid="cell-frame-container"]').length,
                        currentChat: !!document.querySelector('[data-testid="conversation-panel-messages"]'),
                        messageInput: !!document.querySelector('[data-testid="conversation-compose-box-input"]'),
                        waVersion: document.querySelector('meta[name="version"]')?.content || 'unknown',
                        timestamp: new Date().toISOString()
                    };
                    document.getElementById('wocs-state-output').innerHTML =
                        `<pre>${JSON.stringify(state, null, 2)}</pre>`;
                });
                break;

            case 'aiengine':
                // Save AI Config
                document.getElementById('wocs-save-ai-config')?.addEventListener('click', () => {
                    const config = {
                        provider: document.getElementById('wocs-ai-provider')?.value,
                        apiKey: document.getElementById('wocs-ai-key')?.value
                    };
                    chrome.storage.local.set({ wocsAIConfig: config });
                    showNotification('✅ AI Config saved!');
                });

                // Load saved config
                chrome.storage.local.get(['wocsAIConfig'], (result) => {
                    if (result.wocsAIConfig) {
                        document.getElementById('wocs-ai-provider').value = result.wocsAIConfig.provider;
                        document.getElementById('wocs-ai-key').value = result.wocsAIConfig.apiKey || '';
                    }
                });

                // Generate Reply
                document.getElementById('wocs-generate-reply')?.addEventListener('click', async () => {
                    const context = document.getElementById('wocs-ai-context')?.value;
                    const tone = document.getElementById('wocs-ai-tone')?.value;

                    const config = await chrome.storage.local.get(['wocsAIConfig']);
                    if (!config.wocsAIConfig?.apiKey) {
                        showNotification('⚠️ Please configure API key first!');
                        return;
                    }

                    document.getElementById('wocs-reply-result').innerHTML = '⏳ Generating...';

                    try {
                        const reply = await callAI(config.wocsAIConfig,
                            `Generate a ${tone} reply to: "${context}". Keep it short and natural.`);
                        document.getElementById('wocs-reply-result').innerHTML =
                            `<div class="wocs-ai-response">${reply}</div>
                             <button class="wocs-btn-sm" onclick="navigator.clipboard.writeText('${reply.replace(/'/g, "\\'")}')">📋 Copy</button>`;
                    } catch (e) {
                        document.getElementById('wocs-reply-result').innerHTML = `❌ Error: ${e.message}`;
                    }
                });

                // Translate
                document.getElementById('wocs-translate')?.addEventListener('click', async () => {
                    const text = document.getElementById('wocs-translate-text')?.value;
                    const lang = document.getElementById('wocs-translate-lang')?.value;

                    const config = await chrome.storage.local.get(['wocsAIConfig']);
                    if (!config.wocsAIConfig?.apiKey) {
                        showNotification('⚠️ Configure API key first!');
                        return;
                    }

                    const langNames = { ms: 'Malay', en: 'English', zh: 'Chinese', ta: 'Tamil', ar: 'Arabic' };
                    document.getElementById('wocs-translate-result').innerHTML = '⏳ Translating...';

                    try {
                        const result = await callAI(config.wocsAIConfig,
                            `Translate to ${langNames[lang]}: "${text}". Reply with only the translation.`);
                        document.getElementById('wocs-translate-result').innerHTML = result;
                    } catch (e) {
                        document.getElementById('wocs-translate-result').innerHTML = `❌ ${e.message}`;
                    }
                });

                // Sentiment Analysis
                document.getElementById('wocs-analyze-sentiment')?.addEventListener('click', async () => {
                    const text = document.getElementById('wocs-sentiment-text')?.value;

                    const config = await chrome.storage.local.get(['wocsAIConfig']);
                    if (!config.wocsAIConfig?.apiKey) {
                        showNotification('⚠️ Configure API key first!');
                        return;
                    }

                    document.getElementById('wocs-sentiment-result').innerHTML = '⏳ Analyzing...';

                    try {
                        const result = await callAI(config.wocsAIConfig,
                            `Analyze sentiment of: "${text}". Reply with: emoji + one word (Positive/Negative/Neutral) + brief reason.`);
                        document.getElementById('wocs-sentiment-result').innerHTML = result;
                    } catch (e) {
                        document.getElementById('wocs-sentiment-result').innerHTML = `❌ ${e.message}`;
                    }
                });
                break;

            case 'mcpbridge':
                // Connect to MCP
                document.getElementById('wocs-mcp-connect')?.addEventListener('click', async () => {
                    const url = document.getElementById('wocs-mcp-url')?.value;
                    const transport = document.getElementById('wocs-mcp-transport')?.value;

                    if (!url) {
                        showNotification('Enter MCP server URL!');
                        return;
                    }

                    const statusEl = document.getElementById('wocs-mcp-status');
                    statusEl.innerHTML = '<span class="wocs-status-dot connecting"></span><span>Connecting...</span>';

                    try {
                        // For now, just test connectivity
                        const response = await fetch(url, { method: 'OPTIONS' }).catch(() => null);
                        if (response) {
                            statusEl.innerHTML = '<span class="wocs-status-dot connected"></span><span>Connected</span>';
                            chrome.storage.local.set({ wocsMCPServer: { url, transport } });
                            showNotification('✅ Connected to MCP server!');
                        } else {
                            throw new Error('Could not reach server');
                        }
                    } catch (e) {
                        statusEl.innerHTML = '<span class="wocs-status-dot disconnected"></span><span>Failed</span>';
                        showNotification(`❌ Connection failed: ${e.message}`);
                    }
                });

                // Discover Tools
                document.getElementById('wocs-discover-tools')?.addEventListener('click', async () => {
                    const config = await chrome.storage.local.get(['wocsMCPServer']);
                    if (!config.wocsMCPServer?.url) {
                        showNotification('Connect to server first!');
                        return;
                    }

                    const toolList = document.getElementById('wocs-mcp-toollist');
                    toolList.innerHTML = '<div class="wocs-empty">⏳ Discovering tools...</div>';

                    // Simulated tool discovery (real MCP would use proper protocol)
                    setTimeout(() => {
                        const mockTools = [
                            { name: 'execute_sql', desc: 'Run SQL queries' },
                            { name: 'list_tables', desc: 'List database tables' },
                            { name: 'get_schema', desc: 'Get table schema' }
                        ];
                        toolList.innerHTML = mockTools.map(t =>
                            `<div class="wocs-tool-item" data-tool="${t.name}">
                                <strong>${t.name}</strong>
                                <small>${t.desc}</small>
                            </div>`
                        ).join('');
                    }, 1000);
                });

                // Execute Tool
                document.getElementById('wocs-execute-tool')?.addEventListener('click', async () => {
                    const toolName = document.getElementById('wocs-mcp-toolname')?.value;
                    const params = document.getElementById('wocs-mcp-params')?.value;

                    if (!toolName) {
                        showNotification('Enter tool name!');
                        return;
                    }

                    const resultEl = document.getElementById('wocs-mcp-result');
                    resultEl.innerHTML = '<pre>⏳ Executing...</pre>';

                    try {
                        const parsedParams = params ? JSON.parse(params) : {};
                        // Simulated execution
                        setTimeout(() => {
                            resultEl.innerHTML = `<pre>${JSON.stringify({
                                tool: toolName,
                                params: parsedParams,
                                result: 'Tool executed successfully (simulated)',
                                timestamp: new Date().toISOString()
                            }, null, 2)}</pre>`;
                        }, 1000);
                    } catch (e) {
                        resultEl.innerHTML = `<pre style="color: #ef4444;">Error: ${e.message}</pre>`;
                    }
                });

                // Preset servers
                document.querySelectorAll('[data-mcp]').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const presets = {
                            supabase: 'https://api.supabase.com/mcp',
                            github: 'https://api.github.com/mcp',
                            prisma: 'http://localhost:5555/mcp',
                            sequential: 'http://localhost:3001'
                        };
                        document.getElementById('wocs-mcp-url').value = presets[btn.dataset.mcp];
                        showNotification(`Preset: ${btn.dataset.mcp}`);
                    });
                });
                break;
        }

        // Apply settings
        function applySettings(settings) {
            if (settings?.privacy) {
                document.body.classList.toggle('wocs-blur-names', settings.privacy.blurContactNames);
                document.body.classList.toggle('wocs-blur-photos', settings.privacy.blurContactPhotos);
            }
        }

        // ===========================================
        // INITIALIZATION
        // ===========================================

        function waitForWhatsApp() {
            return new Promise(resolve => {
                const check = () => {
                    const chatList = document.querySelector('[data-testid="chat-list"]');
                    if (chatList) {
                        resolve(true);
                    } else {
                        setTimeout(check, 500);
                    }
                };
                check();
            });
        }

        async function initWOCS() {
            console.log('[WOCS] Waiting for WhatsApp...');
            await waitForWhatsApp();
            console.log('[WOCS] WhatsApp loaded!');

            // Inject UI components
            injectSidebar();
            injectTopNav();
            injectPanelContainer();

            // Adjust WhatsApp layout
            document.body.style.paddingTop = '56px';
            const app = document.getElementById('app');
            if (app) app.style.marginRight = '70px';

            // Load and apply settings
            chrome.storage.local.get(['wocsSettings'], result => {
                if (result.wocsSettings) applySettings(result.wocsSettings);
            });

            window.WOCS.isReady = true;
            console.log('[WOCS] ✅ Initialized!');
            showNotification('🌶️ WOCS Active!');

            // Auto-refresh stats every 30 seconds
            setInterval(() => {
                const stats = getStats();
                const countEls = document.querySelectorAll('.wocs-tab-count');
                if (countEls.length >= 5) {
                    countEls[0].textContent = stats.totalChats;
                    countEls[1].textContent = stats.unread;
                    countEls[2].textContent = stats.groups;
                    countEls[3].textContent = stats.contacts;
                    countEls[4].textContent = stats.unsaved;
                }
            }, 30000);
        }

        // Start
        initWOCS();
    }) ();

