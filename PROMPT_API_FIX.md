# Fixing "Prompt API not available" Error

## Issue
The extension shows "Prompt API not available" even though it works in other extensions in the same browser.

## Root Cause
The Prompt API (`window.ai`) is experimental and has restrictions in Chrome extension contexts. It requires specific configuration to work in side panels.

## ✅ Applied Fixes

### 1. Updated manifest.json
Added Content Security Policy to allow WebAssembly (required for AI model):
```json
"content_security_policy": {
  "extension_pages": "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'"
}
```

### 2. Updated sidepanel.html
Added CSP meta tag:
```html
<meta http-equiv="Content-Security-Policy" content="script-src 'self' 'wasm-unsafe-eval'; object-src 'self'" />
```

## 🔄 Next Steps

### Step 1: Reload the Extension
1. Go to `chrome://extensions/`
2. Find "AI Notes" extension
3. Click the **reload icon** (↻)
4. **OR** Remove and re-load from `/Users/jk/Code/ai-notes-extension/dist`

### Step 2: Verify Flags Are Enabled
```
chrome://flags/#prompt-api-for-gemini-nano → Enabled
chrome://flags/#optimization-guide-on-device-model → Enabled BypassPerfRequirement
```

### Step 3: Check Model Download
1. Go to `chrome://components/`
2. Find **"Optimization Guide On Device Model"**
3. Should show version number (not "0.0.0.0")
4. If 0.0.0.0, click "Check for update"

### Step 4: Test in DevTools
1. Open the side panel
2. Right-click anywhere → **Inspect**
3. In Console tab, run:
```javascript
await window.ai?.languageModel?.capabilities()
```

**Expected output:**
```javascript
{available: "readily"}
```

**If you see `undefined` or error:**
- The API isn't available in this context yet
- Try the workaround below

## 🛠️ Alternative Workaround

If the Prompt API still doesn't work in the side panel, you can use a hybrid approach:

### Option A: Use an iframe
The side panel loads a regular web page in an iframe that has access to the Prompt API.

### Option B: Offscreen document
Use Chrome's Offscreen API to create a hidden document with API access.

### Option C: Content script injection
Run the AI in the content script context (on the actual webpage) and message back to the side panel.

## 📊 Debug Information

### Check if other extensions work
If other extensions with Prompt API work, compare their manifest:
```bash
# Find another working extension
cd ~/Library/Application\ Support/Google/Chrome/Default/Extensions/
# Look at their manifest.json
```

### Check Chrome version
```javascript
navigator.userAgent
// Should be Chrome 127+ or Canary/Dev channel
```

### Check experimental features
```
chrome://version/
// Look for "Experimental features"
```

## 🚨 Known Limitations

1. **Extension contexts are restricted**: Some Web APIs don't work in extension pages by default
2. **Side Panel API is new**: It might have different restrictions than regular extension pages
3. **Prompt API is experimental**: May change or have bugs
4. **Model download required**: Can take several minutes on first launch

## ✅ If Still Not Working

Try this diagnostic script in the side panel console:

```javascript
console.log('window.ai:', window.ai);
console.log('navigator.userAgent:', navigator.userAgent);
console.log('location:', location.href);

if (window.ai) {
  window.ai.languageModel.capabilities().then(cap => {
    console.log('Capabilities:', cap);
  }).catch(err => {
    console.error('Error:', err);
  });
} else {
  console.error('window.ai is undefined');
}
```

**Share the console output for further debugging.**

## 📖 Alternative: Test in Regular Web Page First

If you want to verify the Prompt API works on your system:

1. Create a simple HTML file:
```html
<!DOCTYPE html>
<html>
<head><title>AI Test</title></head>
<body>
  <button onclick="test()">Test AI</button>
  <pre id="output"></pre>
  <script>
    async function test() {
      const output = document.getElementById('output');
      try {
        const cap = await window.ai.languageModel.capabilities();
        output.textContent = JSON.stringify(cap, null, 2);
        
        if (cap.available === 'readily') {
          const session = await window.ai.languageModel.create();
          const result = await session.prompt('Say hello!');
          output.textContent += '\n\nResponse: ' + result;
        }
      } catch (error) {
        output.textContent = 'Error: ' + error.message;
      }
    }
  </script>
</body>
</html>
```

2. Open in Chrome (not as extension, just file:// or http://)
3. If it works here but not in extension, it confirms the context restriction

## 🎯 Expected Behavior After Fix

Once working, you should see:
1. No "Prompt API not available" error
2. AI Assistant panel shows "Generate" button (not disabled)
3. Clicking quick actions (Summarize, Explain, etc.) triggers AI
4. Console shows successful session creation

---

**Status:** Fixes applied, extension rebuilt  
**Action Required:** Reload extension and test  
**Last Updated:** 2025-10-31

