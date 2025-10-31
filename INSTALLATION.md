# Installation Guide - AI Notes Extension

## Prerequisites

1. **Chrome or Edge Browser** (version 121 or later)
2. **Node.js and npm** installed

## Step 1: Enable Prompt API

The AI features require Chrome's experimental Prompt API:

1. Open Chrome/Edge
2. Navigate to `chrome://flags/#prompt-api-for-gemini-nano`
3. Set the flag to **Enabled**
4. Navigate to `chrome://flags/#optimization-guide-on-device-model`
5. Set the flag to **Enabled BypassPerfRequirement**
6. Restart the browser
7. Wait for the Gemini Nano model to download (this happens automatically)

To check if the model is ready:
1. Open DevTools (F12)
2. Run: `await window.ai.languageModel.capabilities()`
3. Should return `{ available: "readily" }`

## Step 2: Build the Extension

```bash
cd /Users/jk/Code/ai-whiteboard/extension
npm install
npm run build
```

This creates a `dist/` folder with all extension files.

## Step 3: Load the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the folder: `/Users/jk/Code/ai-whiteboard/extension/dist`
5. The extension should now appear in your extensions list

## Step 4: Verify Installation

1. Click the extension icon in the Chrome toolbar
2. The AI Notes side panel should open on the right side
3. You should see the Notes Editor interface

## Usage

### Quick Start

1. **Open Side Panel**: Click the extension icon or use the keyboard shortcut
2. **Create Note**: Click "+ New Note" button
3. **Add Selected Text**: 
   - Select text on any webpage
   - Right-click → "Add to Notes"
   - Or press `Ctrl+Shift+N` (Windows/Linux) or `Cmd+Shift+N` (Mac)

### AI Assistant Features

The AI Assistant panel at the bottom offers:
- **Summarize**: Condense selected text
- **Explain**: Get detailed explanations
- **Expand**: Add more details to notes
- **Questions**: Generate study questions

### Tips

- Notes are automatically saved as you type
- Selected text from webpages automatically includes the source URL
- Use the quick action buttons for common AI tasks
- Press Enter to submit prompts (Shift+Enter for new lines)

## Troubleshooting

### "Prompt API not available"
- Make sure you enabled both flags in `chrome://flags`
- Restart Chrome completely
- Wait for model download (check `chrome://components/` for "Optimization Guide On Device Model")

### Extension won't load
- Make sure you're in Developer mode
- Check that you selected the `dist` folder (not the parent `extension` folder)
- Check the browser console for errors

### Side panel doesn't open
- Try clicking the extension icon again
- Check `chrome://extensions/` to ensure the extension is enabled
- Reload the extension

### AI features not working
- Open DevTools and check the console for errors
- Verify Prompt API is available: `await window.ai.languageModel.capabilities()`
- Try refreshing the side panel

## Development Mode

For development with auto-rebuild:

```bash
npm run dev
```

Then manually reload the extension in `chrome://extensions/` after changes.

## Uninstallation

1. Go to `chrome://extensions/`
2. Find "AI Notes" extension
3. Click **Remove**
4. Confirm removal

