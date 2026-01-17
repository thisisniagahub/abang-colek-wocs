/**
 * WOCS Background Service Worker
 * Handles background tasks and storage management
 */

// Extension installed
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('🌶️ WOCS Extension installed!');

        // Initialize storage
        chrome.storage.local.set({
            contacts: [],
            labels: {},
            messagesSent: 0,
            templates: [],
            settings: {
                autoReply: false,
                bulkDelay: 1000,
                theme: 'dark'
            }
        });
    }
});

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('WOCS Background received:', message);

    switch (message.action) {
        case 'saveContacts':
            saveContacts(message.contacts);
            sendResponse({ success: true });
            break;

        case 'incrementMessageCount':
            incrementMessageCount();
            sendResponse({ success: true });
            break;

        case 'getSettings':
            getSettings().then(sendResponse);
            return true; // Async response

        default:
            sendResponse({ error: 'Unknown action' });
    }
});

// Save contacts to storage
async function saveContacts(contacts) {
    const existing = await chrome.storage.local.get(['contacts']);
    const merged = mergeContacts(existing.contacts || [], contacts);
    await chrome.storage.local.set({ contacts: merged });
    console.log(`🌶️ WOCS: Saved ${merged.length} contacts`);
}

// Merge contacts without duplicates
function mergeContacts(existing, newContacts) {
    const map = new Map();

    existing.forEach(c => map.set(c.phone || c.name, c));
    newContacts.forEach(c => map.set(c.phone || c.name, c));

    return Array.from(map.values());
}

// Increment message counter
async function incrementMessageCount() {
    const data = await chrome.storage.local.get(['messagesSent']);
    const count = (data.messagesSent || 0) + 1;
    await chrome.storage.local.set({ messagesSent: count });
}

// Get settings
async function getSettings() {
    const data = await chrome.storage.local.get(['settings']);
    return data.settings || {};
}

console.log('🌶️ WOCS Service Worker started');
