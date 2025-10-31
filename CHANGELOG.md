# Changelog - AI Notes Extension

All notable changes to the AI Notes Chrome Extension will be documented in this file.

## [1.0.0] - 2025-10-31

### Added - Initial Release

#### Core Features
- **Chrome Side Panel Integration**: Extension opens as a side panel in Chrome/Edge browsers
- **AI-Powered Note Taking**: Integrated Chrome Prompt API (Gemini Nano) for intelligent note assistance
- **Web Content Extraction**: Capture selected text from any webpage with source attribution
- **Context Menu**: Right-click "Add to Notes" on selected text
- **Keyboard Shortcut**: `Ctrl+Shift+N` to quickly capture selected text
- **Persistent Storage**: Notes saved automatically via `chrome.storage.local`

#### Components

**manifest.json**
- Manifest v3 configuration
- Permissions: `sidePanel`, `activeTab`, `storage`, `contextMenus`, `scripting`
- Host permissions for all URLs (content extraction)
- Side panel and content script registration

**background.js**
- Service worker for extension lifecycle management
- Extension icon click handler (opens side panel)
- Context menu creation and handling
- Message routing between content scripts and side panel

**content.js**
- Text selection detection on web pages
- Keyboard shortcut handler (`Ctrl+Shift+N`)
- Page metadata extraction (title, URL, timestamp)
- Message passing to background script

**NoteEditor.jsx**
- Dual-pane interface: notes list + editor
- Create, read, update, delete notes
- Auto-save functionality (500ms debounce)
- Source URL display for web-captured content
- Rich text editing with textarea
- Note list with title, preview, and timestamp

**AIAssistant.jsx**
- Chrome Prompt API integration
- System prompt optimized for note-taking tasks
- Quick action buttons: Summarize, Explain, Expand, Questions
- JSON response parsing with fallback
- Auto-fill selected text from webpages
- Markdown code block stripping
- Context-aware responses (updates existing note or creates new)
- Error handling and user feedback

**notesStore.js**
- Zustand state management
- CRUD operations for notes
- `chrome.storage.local` integration
- Selected text and page context management
- Search and tag filtering capabilities
- Auto-initialization from storage on load

**App.jsx**
- Main application container
- Header with title and AI toggle
- Message listener for content script communication
- Responsive layout with fixed header and scrollable content

#### Build Configuration

**vite.config.js**
- Multi-entry build setup
- Output to `dist/` folder
- Asset naming configuration
- Development server on port 5174

**package.json**
- Build scripts: `dev`, `build`, `copy-files`
- Dependencies: React 19, Zustand 5, nanoid 5
- No Konva/canvas dependencies (lightweight)

#### User Experience
- Dark theme UI (slate/blue color scheme)
- Responsive design optimized for side panel width
- Smooth transitions and hover effects
- Custom scrollbar styling
- Auto-focus behavior for better UX
- Enter key submission (Shift+Enter for new lines)
- Backspace/Delete event handling fixed

#### AI Features
- **Summarize**: Condense selected text into key points
- **Explain**: Get detailed explanations of concepts
- **Expand**: Add more details and context to notes
- **Questions**: Generate study/review questions
- Structured JSON responses with title, content, tags, key points
- Auto-tagging based on AI analysis
- Source attribution for web content

### Technical Decisions

1. **No Konva/Canvas**: Removed whiteboard features to create lightweight extension focused on notes
2. **Chrome Storage**: Used `chrome.storage.local` instead of localStorage for proper extension persistence
3. **Uncontrolled Textarea**: Optimized input performance by avoiding re-renders
4. **Event Propagation**: Careful handling of keyboard events to prevent conflicts
5. **Manifest v3**: Used latest extension manifest format
6. **Prompt API**: Leveraged on-device AI (Gemini Nano) for privacy and speed

### File Structure
```
extension/
├── manifest.json           # Extension configuration
├── background.js           # Service worker
├── content.js             # Content script
├── sidepanel.html         # Side panel entry (production)
├── package.json           # Dependencies & scripts
├── vite.config.js        # Build configuration
├── README.md             # Project overview
├── INSTALLATION.md       # Setup instructions
├── CHANGELOG.md          # This file
└── sidepanel/            # React app source
    ├── index.html        # Dev entry point
    └── src/
        ├── main.jsx      # React entry
        ├── App.jsx       # Main component
        ├── App.css       # App styles
        ├── index.css     # Global styles
        ├── components/
        │   ├── NoteEditor.jsx     # Note editing UI
        │   └── AIAssistant.jsx    # AI integration
        └── state/
            └── notesStore.js      # State management
```

### Known Limitations

1. Requires Chrome 121+ with Prompt API flags enabled
2. Gemini Nano model download required (happens automatically)
3. AI features only work when model is available
4. Side panel API not available in all contexts (e.g., chrome:// pages)
5. No rich text formatting (plain text/markdown only)
6. No image embedding in notes (yet)
7. No note export/import (yet)
8. No sync across devices (local storage only)

### Future Enhancements (Potential)

- [ ] Markdown rendering for notes
- [ ] Image capture and embedding
- [ ] Note export (JSON, Markdown, PDF)
- [ ] Chrome sync for cross-device access
- [ ] Tags autocomplete
- [ ] Search functionality
- [ ] Note sharing/collaboration
- [ ] More AI actions (translate, rewrite, etc.)
- [ ] Custom AI prompts
- [ ] Keyboard shortcuts customization
- [ ] Light theme option
- [ ] Note templates
- [ ] Folder/category organization

