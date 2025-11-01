// Content script for text selection, AI messaging, and page script injection

const SCRIPT_ID = '__ai_notes_prompt_script__';
const EXTENSION_SOURCE = 'AI_NOTES_EXTENSION';
const PAGE_SOURCE = 'AI_NOTES_PAGE';

function injectPageScript() {
  if (document.getElementById(SCRIPT_ID)) {
    return;
  }

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.src = chrome.runtime.getURL('pagePrompt.js');
  script.type = 'text/javascript';
  script.async = true;
  (document.head || document.documentElement).appendChild(script);
}

injectPageScript();

// Listen for text selection
document.addEventListener('mouseup', () => {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText) {
    chrome.storage.local.set({
      lastSelection: {
        text: selectedText,
        sourceUrl: window.location.href,
        pageTitle: document.title,
        timestamp: Date.now()
      }
    });
  }
});

// Listen for keyboard shortcuts (e.g., Ctrl+Shift+N)
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'N') {
    e.preventDefault();
    const selectedText = window.getSelection().toString().trim();

    if (selectedText) {
      chrome.runtime.sendMessage({
        type: 'OPEN_SIDE_PANEL',
        text: selectedText,
        sourceUrl: window.location.href,
        pageTitle: document.title,
        timestamp: Date.now()
      });
    }
  }
});

// Handle requests from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message !== 'object') {
    return false;
  }

  if (message.type === 'GET_PAGE_INFO') {
    const pageInfo = {
      title: document.title,
      url: window.location.href,
      selectedText: window.getSelection().toString().trim(),
      timestamp: Date.now()
    };
    sendResponse(pageInfo);
    return true;
  }

  if (message.type === 'CONTENT_PROMPT_REQUEST') {
    if (!message.requestId || !message.prompt) {
      sendResponse({ ok: false, error: 'Invalid prompt request' });
      return false;
    }

    injectPageScript();

    window.postMessage(
      {
        source: EXTENSION_SOURCE,
        type: 'PAGE_PROMPT',
        requestId: message.requestId,
        prompt: message.prompt,
        systemPrompt: message.systemPrompt
      },
      '*'
    );

    sendResponse({ ok: true });
    return false;
  }

  return false;
});

// Listen for responses from the injected page script
window.addEventListener('message', (event) => {
  if (event.source !== window) {
    return;
  }

  const data = event.data;
  if (!data || data.source !== PAGE_SOURCE) {
    return;
  }

  if (data.type === 'PAGE_PROMPT_RESULT') {
    chrome.runtime.sendMessage({
      type: 'PROMPT_AI_RESULT',
      requestId: data.requestId,
      success: Boolean(data.success),
      response: data.response || null,
      error: data.error || null
    });
  }
});

