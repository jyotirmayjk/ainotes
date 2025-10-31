// Content script for text selection and page content extraction

// Listen for text selection
document.addEventListener('mouseup', () => {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText) {
    // Store selected text temporarily
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
      // Send to background script to open side panel
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

// Extract page metadata on request
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_PAGE_INFO') {
    const pageInfo = {
      title: document.title,
      url: window.location.href,
      selectedText: window.getSelection().toString().trim(),
      timestamp: Date.now()
    };
    sendResponse(pageInfo);
  }
  return true;
});

