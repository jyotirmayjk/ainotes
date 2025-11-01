// Background service worker for AI Notes extension

const pendingPromptRequests = new Map();

function createRequestId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

// Handle extension icon clicks - open side panel
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// Create context menu for "Add to Notes"
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'add-to-notes',
    title: 'Add to Notes',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'add-to-notes') {
    chrome.runtime.sendMessage({
      type: 'SELECTED_TEXT',
      text: info.selectionText,
      sourceUrl: tab.url,
      pageTitle: tab.title,
      timestamp: Date.now()
    });

    chrome.sidePanel.open({ windowId: tab.windowId });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message !== 'object') {
    return false;
  }

  if (message.type === 'OPEN_SIDE_PANEL') {
    if (sender?.tab?.windowId) {
      chrome.sidePanel.open({ windowId: sender.tab.windowId });
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'No active tab' });
    }
    return true;
  }

  if (message.type === 'PROMPT_AI_REQUEST') {
    (async () => {
      try {
        const tab = await getActiveTab();
        if (!tab || tab.id == null) {
          sendResponse({ success: false, error: 'No active tab available' });
          return;
        }

        // Check if the page URL supports the Prompt API
        const url = tab.url || '';
        if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('edge://')) {
          sendResponse({ 
            success: false, 
            error: 'Prompt API is not available on Chrome internal pages. Please navigate to a regular website (https://).' 
          });
          return;
        }

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          sendResponse({ 
            success: false, 
            error: 'Prompt API is only available on http:// and https:// pages.' 
          });
          return;
        }

        const requestId = createRequestId();
        pendingPromptRequests.set(requestId, sendResponse);

        chrome.tabs.sendMessage(
          tab.id,
          {
            type: 'CONTENT_PROMPT_REQUEST',
            requestId,
            prompt: message.prompt,
            systemPrompt: message.systemPrompt
          },
          (response) => {
            if (chrome.runtime.lastError) {
              const callback = pendingPromptRequests.get(requestId);
              if (callback) {
                // Provide more helpful error messages
                let errorMsg = chrome.runtime.lastError.message;
                if (errorMsg.includes('Could not establish connection')) {
                  errorMsg = 'Content script not loaded on this page. Try refreshing the page.';
                }
                callback({ success: false, error: errorMsg });
                pendingPromptRequests.delete(requestId);
              }
              return;
            }

            if (response && response.ok === false) {
              const callback = pendingPromptRequests.get(requestId);
              if (callback) {
                callback({ success: false, error: response.error || 'Prompt request failed' });
                pendingPromptRequests.delete(requestId);
              }
            }
          }
        );
      } catch (error) {
        sendResponse({ success: false, error: error?.message || 'Failed to access Prompt API' });
      }
    })();

    return true;
  }

  if (message.type === 'PROMPT_AI_RESULT') {
    const callback = pendingPromptRequests.get(message.requestId);
    if (callback) {
      callback({
        success: Boolean(message.success),
        response: message.response || null,
        error: message.error || null
      });
      pendingPromptRequests.delete(message.requestId);
    }
    return false;
  }

  return false;
});

