(() => {
  const EXTENSION_SOURCE = 'AI_NOTES_EXTENSION';
  const PAGE_SOURCE = 'AI_NOTES_PAGE';

  const sessions = new Map();
  let initError = null;

  function stripMarkdownCodeBlocks(text) {
    if (!text || typeof text !== 'string') return text;
    let cleaned = text.trim();
    cleaned = cleaned.replace(/^```(?:json|javascript|js)?\s*\n?/i, '');
    cleaned = cleaned.replace(/\n?```\s*$/i, '');
    return cleaned.trim();
  }

  async function getSession(systemPrompt) {
    const promptKey = systemPrompt || 'default';

    if (sessions.has(promptKey)) {
      return sessions.get(promptKey);
    }

    if (!window.ai?.languageModel) {
      const pageUrl = window.location.href;
      let errorMsg = 'Prompt API not available on this page';
      
      if (pageUrl.startsWith('chrome://') || pageUrl.startsWith('chrome-extension://')) {
        errorMsg = 'Prompt API is not available on Chrome internal pages. Please navigate to a regular website (https://).';
      } else if (!pageUrl.startsWith('http://') && !pageUrl.startsWith('https://')) {
        errorMsg = 'Prompt API is only available on http:// and https:// pages.';
      } else {
        errorMsg = 'Prompt API is not available. Make sure Chrome flags are enabled: chrome://flags/#prompt-api-for-gemini-nano';
      }
      
      initError = errorMsg;
      throw new Error(initError);
    }

    const capabilities = await window.ai.languageModel.capabilities();
    if (capabilities.available === 'no') {
      initError = 'Language model not available. Check chrome://components/ for "Optimization Guide On Device Model" and ensure it\'s downloaded.';
      throw new Error(initError);
    }

    const session = await window.ai.languageModel.create({
      systemPrompt: systemPrompt || undefined
    });

    sessions.set(promptKey, session);
    return session;
  }

  async function handlePromptRequest(eventData) {
    const { requestId, prompt, systemPrompt } = eventData;

    if (!requestId || !prompt) {
      throw new Error('Invalid prompt payload');
    }

    const session = await getSession(systemPrompt);
    const aiResponse = await session.prompt(prompt);

    const cleaned = stripMarkdownCodeBlocks(aiResponse);
    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch (_) {
      parsed = {
        action: 'expand',
        title: 'AI Generated Note',
        content: aiResponse,
        tags: [],
        keyPoints: []
      };
    }

    return parsed;
  }

  function postResult(data) {
    window.postMessage(
      {
        source: PAGE_SOURCE,
        type: 'PAGE_PROMPT_RESULT',
        requestId: data.requestId,
        success: data.success,
        response: data.response || null,
        error: data.error || null
      },
      '*'
    );
  }

  window.addEventListener('message', (event) => {
    if (event.source !== window) {
      return;
    }

    const data = event.data;
    if (!data || data.source !== EXTENSION_SOURCE || data.type !== 'PAGE_PROMPT') {
      return;
    }

    (async () => {
      try {
        if (initError) {
          throw new Error(initError);
        }

        const response = await handlePromptRequest(data);
        postResult({ requestId: data.requestId, success: true, response });
      } catch (error) {
        postResult({
          requestId: data.requestId,
          success: false,
          error: error?.message || 'Prompt API failed'
        });
      }
    })();
  });

  window.addEventListener('unload', () => {
    sessions.forEach((session) => {
      try {
        session.destroy();
      } catch (_) {
        // Ignore
      }
    });
    sessions.clear();
  });
})();
