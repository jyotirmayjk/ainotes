# Quick Start - AI Notes Extension

## 🚀 Get Started in 3 Steps

### Step 1: Enable AI (One-time setup)

Open Chrome and paste these URLs in the address bar, one at a time:

1. `chrome://flags/#prompt-api-for-gemini-nano` → Set to **Enabled**
2. `chrome://flags/#optimization-guide-on-device-model` → Set to **Enabled BypassPerfRequirement**
3. Restart Chrome
4. Wait 2-3 minutes for the AI model to download in the background

**Verify AI is ready:**
- Press F12 (DevTools)
- In Console tab, type: `await window.ai.languageModel.capabilities()`
- Should show: `{available: "readily"}`

### Step 2: Load Extension

1. Open `chrome://extensions/`
2. Toggle **Developer mode** ON (top right)
3. Click **Load unpacked**
4. Navigate to: `/Users/jk/Code/ai-whiteboard/extension/dist`
5. Click **Select**

✅ You should see "AI Notes" in your extensions list!

### Step 3: Try It Out

**Test 1: Open Side Panel**
- Click the extension icon in Chrome toolbar
- Side panel opens on the right
- Click "+ New Note" to create your first note

**Test 2: Capture Web Content**
1. Go to any website (e.g., Wikipedia article)
2. Select some text
3. Right-click → **Add to Notes**
4. Side panel opens with the text ready for AI processing

**Test 3: Use AI**
- Click "Summarize" to condense the text
- Or type your own prompt (e.g., "explain this in simple terms")
- Press Enter
- AI generates a note automatically!

## 🎨 Quick Tips

- **Keyboard shortcut**: `Ctrl+Shift+N` to capture selected text
- **Quick actions**: Use buttons (Summarize, Explain, Expand, Questions)
- **Auto-save**: Notes save automatically as you type
- **Press Enter**: Submit AI prompts (Shift+Enter for new line)
- **Source links**: Click blue links to go back to original webpage

## 🐛 Troubleshooting

**"Prompt API not available"**
→ Check flags are enabled, restart Chrome, wait for model download

**Can't load extension**
→ Make sure you select the `dist` folder, not the parent folder

**Side panel doesn't open**
→ Try clicking the extension icon again or reload the extension

**AI not responding**
→ Open DevTools (F12), check Console for errors

## 📝 What You Get

✨ **Smart Notes**: AI-powered summarization and explanation  
🌐 **Web Capture**: Save text from any webpage with source links  
💾 **Auto-save**: Never lose your notes  
🎯 **Context Menu**: Right-click to add selections  
⚡ **Fast**: AI runs locally (Gemini Nano)  
🔒 **Private**: No data sent to servers  

## 🔄 Rebuilding After Changes

If you modify the code:

```bash
cd /Users/jk/Code/ai-whiteboard/extension
npm run build
```

Then go to `chrome://extensions/` and click the reload icon on the extension.

---

**Need more help?** See [INSTALLATION.md](./INSTALLATION.md) for detailed instructions.

