// Background service worker for AI Notes extension

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
    // Send selected text to side panel
    chrome.runtime.sendMessage({
      type: 'SELECTED_TEXT',
      text: info.selectionText,
      sourceUrl: tab.url,
      pageTitle: tab.title,
      timestamp: Date.now()
    });
    
    // Open side panel
    chrome.sidePanel.open({ windowId: tab.windowId });
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OPEN_SIDE_PANEL') {
    chrome.sidePanel.open({ windowId: sender.tab.windowId });
    sendResponse({ success: true });
  }
  return true;
});

