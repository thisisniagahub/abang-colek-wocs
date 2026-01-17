/**
 * WOCS Popup Script
 * Handles UI interactions and communicates with content script
 */

// DOM Elements
const statusEl = document.getElementById('status');
const statusText = document.querySelector('.status-text');
const exportBtn = document.getElementById('exportContacts');
const bulkBtn = document.getElementById('bulkMessage');
const templatesBtn = document.getElementById('templates');
const labelsBtn = document.getElementById('labels');
const templatesSection = document.getElementById('templatesSection');
const bulkSection = document.getElementById('bulkSection');

// Stats elements
const contactCount = document.getElementById('contactCount');
const messageCount = document.getElementById('messageCount');
const labelCount = document.getElementById('labelCount');

// Track connection state
let isConnected = false;
let currentTabId = null;

// Message templates
const TEMPLATES = {
    order: `🌶️ *ABANG COLEK*

Terima kasih atas pembelian anda!

✅ Order confirmed
📦 Akan dihantar segera

Jumpa lagi! 🔥`,

    reminder: `🌶️ *ABANG COLEK - REMINDER*

Jangan lupa datang event kami!

📅 [DATE]
📍 [LOCATION]

See you there! 🔥`,

    thanks: `🙏 Terima kasih kerana support Abang Colek!

Kami appreciate sangat-sangat ❤️

Follow kami di TikTok: @abangcolek

🌶️🔥`,

    promo: `🔥 *PROMO SPECIAL!* 🔥

Abang Colek ada special deal untuk anda!

[PROMO DETAILS]

Jangan lepaskan! 🌶️`
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await checkWhatsAppConnection();
    await loadStats();
    setupEventListeners();
});

// Check if WhatsApp Web is open and content script is ready
async function checkWhatsAppConnection() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (tab && tab.url && tab.url.includes('web.whatsapp.com')) {
            currentTabId = tab.id;

            // Try to ping content script
            try {
                await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
                setConnected(true);
            } catch (e) {
                // Content script not ready, try to inject it
                console.log('Content script not ready, injecting...');
                try {
                    await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ['content/content.js']
                    });
                    setConnected(true);
                } catch (injectError) {
                    console.log('Could not inject script:', injectError);
                    setConnected(false, 'Refresh WhatsApp Web page');
                }
            }
        } else {
            setConnected(false, 'Open WhatsApp Web first');
        }
    } catch (error) {
        console.error('Connection check failed:', error);
        setConnected(false, 'Connection error');
    }
}

// Set connection status UI
function setConnected(connected, message = null) {
    isConnected = connected;
    if (connected) {
        statusEl.classList.remove('disconnected');
        statusEl.classList.add('connected');
        statusText.textContent = 'Connected to WhatsApp Web';
    } else {
        statusEl.classList.remove('connected');
        statusEl.classList.add('disconnected');
        statusText.textContent = message || 'Not connected';
    }
}

// Load saved stats
async function loadStats() {
    try {
        const data = await chrome.storage.local.get(['contacts', 'messagesSent', 'labels']);
        if (contactCount) contactCount.textContent = data.contacts?.length || 0;
        if (messageCount) messageCount.textContent = data.messagesSent || 0;
        if (labelCount) labelCount.textContent = Object.keys(data.labels || {}).length;
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Export contacts
    exportBtn?.addEventListener('click', async () => {
        if (!isConnected) {
            showNotConnectedAlert();
            return;
        }
        await sendToContentScript({ action: 'extractContacts' });
    });

    // Toggle bulk section
    bulkBtn?.addEventListener('click', () => {
        templatesSection?.classList.add('hidden');
        bulkSection?.classList.toggle('hidden');
    });

    // Toggle templates section
    templatesBtn?.addEventListener('click', () => {
        bulkSection?.classList.add('hidden');
        templatesSection?.classList.toggle('hidden');
    });

    // Labels
    labelsBtn?.addEventListener('click', async () => {
        if (!isConnected) {
            showNotConnectedAlert();
            return;
        }
        await sendToContentScript({ action: 'showLabels' });
    });

    // Template buttons
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!isConnected) {
                showNotConnectedAlert();
                return;
            }
            const templateKey = btn.dataset.template;
            const template = TEMPLATES[templateKey];
            await sendToContentScript({
                action: 'insertTemplate',
                template
            });
        });
    });

    // Generate bulk links
    document.getElementById('sendBulk')?.addEventListener('click', async () => {
        const textarea = document.querySelector('#bulkSection textarea');
        const message = textarea?.value || '';
        const fileInput = document.getElementById('contactFile');

        if (fileInput?.files.length > 0) {
            const file = fileInput.files[0];
            const contacts = await parseContactFile(file);
            generateWaLinks(contacts, message);
        } else {
            alert('Please upload a contact file first');
        }
    });
}

// Show not connected alert
function showNotConnectedAlert() {
    alert('Please open WhatsApp Web and refresh the page first!');
}

// Send message to content script with error handling
async function sendToContentScript(message) {
    if (!isConnected || !currentTabId) {
        showNotConnectedAlert();
        return null;
    }

    try {
        const response = await chrome.tabs.sendMessage(currentTabId, message);
        handleResponse(response);
        return response;
    } catch (error) {
        console.error('Failed to send message:', error);

        // Try to reconnect
        await checkWhatsAppConnection();

        if (!isConnected) {
            alert('Lost connection to WhatsApp Web. Please refresh the page.');
        }
        return null;
    }
}

// Handle response from content script
function handleResponse(response) {
    if (!response) return;

    if (response.contacts) {
        // Download contacts as CSV
        downloadCSV(response.contacts);
        if (contactCount) contactCount.textContent = response.contacts.length;
    }

    if (response.stats) {
        // Update stats display
        if (contactCount) contactCount.textContent = response.stats.totalChats || 0;
    }
}

// Parse contact file (CSV or JSON)
async function parseContactFile(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const content = e.target.result;

            if (file.name.endsWith('.json')) {
                try {
                    resolve(JSON.parse(content));
                } catch {
                    alert('Invalid JSON file');
                    resolve([]);
                }
            } else {
                // CSV parsing
                const lines = content.split('\n');
                const contacts = lines.slice(1).map(line => {
                    const [name, phone] = line.split(',');
                    return { name: name?.trim(), phone: phone?.trim() };
                }).filter(c => c.phone);
                resolve(contacts);
            }
        };

        reader.onerror = () => {
            alert('Error reading file');
            resolve([]);
        };

        reader.readAsText(file);
    });
}

// Generate wa.me links
function generateWaLinks(contacts, message) {
    if (contacts.length === 0) {
        alert('No valid contacts found in file');
        return;
    }

    const encodedMsg = encodeURIComponent(message);

    contacts.forEach((contact, index) => {
        setTimeout(() => {
            const phone = contact.phone.replace(/\D/g, '');
            if (phone) {
                const url = `https://wa.me/${phone}?text=${encodedMsg}`;
                window.open(url, '_blank');
            }
        }, index * 1000); // 1 second delay between each
    });
}

// Download contacts as CSV
function downloadCSV(contacts) {
    if (!contacts || contacts.length === 0) {
        alert('No contacts to export');
        return;
    }

    const headers = 'Name,Phone,Labels\n';
    const rows = contacts.map(c => `"${c.name || ''}","${c.number || c.phone || ''}","${c.labels || ''}"`).join('\n');
    const csv = headers + rows;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `wocs-contacts-${Date.now()}.csv`;
    a.click();

    URL.revokeObjectURL(url);
}
