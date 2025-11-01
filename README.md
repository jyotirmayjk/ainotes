# AI Notes - Chrome Extension

A Chrome/Edge browser extension with AI-powered note-taking capabilities and web content extraction.

## Features

- **Side Panel UI**: Opens a notes panel in the browser sidebar
- **AI Assistant**: Uses Chrome's Prompt API (via injected page script) for intelligent note-taking
- **Content Extraction**: Capture selected text from any webpage
- **Context Menu**: Right-click "Add to Notes" on selected text
- **Persistent Storage**: Notes saved via chrome.storage.local

## Setup

### 1. Install Dependencies

```bash
cd extension
npm install
```

### 2. Build the Extension

```bash
npm run build
```

This will create a `dist/` folder with all extension files.

### 3. Load in Chrome/Edge

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension/dist` folder

### 4. Enable Prompt API

The AI features require Chrome's experimental Prompt API:

1. Go to `chrome://flags/#prompt-api-for-gemini-nano`
2. Enable the flag
3. Restart Chrome
4. The model will download automatically on first use

## Development

For development with hot reload:

```bash
npm run dev
```

Then load the extension from the `dist` folder as described above. You'll need to reload the extension after making changes.

## Usage

1. Click the extension icon to open the side panel
2. Select text on any webpage
3. Right-click and choose "Add to Notes" OR press `Ctrl+Shift+N`
4. The AI Assistant will help summarize, explain, or expand on the content
5. Your notes are automatically saved

## Architecture

- **manifest.json**: Extension configuration
- **background.js**: Service worker for extension lifecycle and AI message routing
- **content.js**: Content script for page interaction
- **pagePrompt.js**: Injected page script that interacts with the Prompt API in the page context
- **sidepanel/**: React app for the side panel UI
  - **NoteEditor.jsx**: Note editing interface
  - **AIAssistant.jsx**: AI-powered note generation
  - **notesStore.js**: State management with Zustand

## Permissions

- `sidePanel`: Side panel API access
- `activeTab`: Read current tab content
- `storage`: Save notes locally
- `contextMenus`: Add context menu items
- `scripting`: Inject content scripts
- `host_permissions`: Access all URLs for content extraction

