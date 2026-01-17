# Chrome Web Store Submission Checklist

## ✅ Package Contents

- [x] manifest.json (Manifest V3)
- [x] popup/ (HTML, CSS, JS)
- [x] content/ (content.js, styles.css)
- [x] background/ (service-worker.js)
- [x] icons/ (icon16.png, icon48.png, icon128.png)
- [x] README.md
- [x] privacy-policy.html
- [x] STORE_LISTING.md
- [x] screenshots/

## ✅ Required Images

| Image | Size | Status |
|-------|------|--------|
| Icon 128x128 | PNG | ✅ Done |
| Icon 48x48 | PNG | ✅ Done |
| Icon 16x16 | PNG | ✅ Done |
| Screenshot | 1280x800 or 640x400 | ✅ Done |
| Promo Small | 440x280 | ✅ Done |

## 📝 Store Listing Info

**Name:** Abang Colek WOCS - WhatsApp CRM  
**Category:** Tools  
**Language:** English (with Malay support)

## 🔒 Privacy Tab Requirements

When filling out Privacy tab in Chrome Developer Dashboard:

1. **Single Purpose:** CRM extension for WhatsApp Web
2. **Permissions Justification:**
   - `storage` - Save user preferences and labels locally
   - `activeTab` - Access WhatsApp Web tab when clicked
   - `scripting` - Inject CRM features into WhatsApp Web
3. **Data Usage:**
   - Contact names/numbers - Exported to user's device only
   - NOT sent to external servers
   - NOT sold to third parties

## 📤 Publishing Steps

1. Go to: <https://chrome.google.com/webstore/devconsole>
2. Click "Add new item"
3. Upload: `abang-colek-wocs-extension.zip`
4. Fill Store Listing (copy from STORE_LISTING.md)
5. Fill Privacy tab
6. Set Distribution (All regions, Public)
7. Submit for Review

## ⏱️ Review Timeline

- First submission: 1-2 weeks
- Updates: Usually faster
