import { useEffect, useRef, useState } from 'react';
import useNotesStore from '../state/notesStore';

const SYSTEM_PROMPT = `You are an AI assistant that helps with note-taking and understanding web content.

You can help users:
1. Summarize selected text from web pages
2. Explain complex concepts in simple terms
3. Expand on brief notes with more details
4. Organize and structure information
5. Generate questions for study/review

Always respond with valid JSON in this format (no markdown, no code blocks):
{
  "action": "summarize" | "explain" | "expand" | "organize" | "question",
  "title": "Suggested note title",
  "content": "Generated note content in markdown format",
  "tags": ["tag1", "tag2"],
  "keyPoints": ["point 1", "point 2"]
}

Keep responses concise and actionable. Use markdown formatting for the content.`;

export default function AIAssistant() {
  const { selectedText, pageContext, createNote, getActiveNote, updateNote, clearSelectedText } = useNotesStore();
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  const promptRef = useRef(null);

  const activeNote = getActiveNote();

  // Initialize AI session
  useEffect(() => {
    const initSession = async () => {
      try {
        if (!window.ai?.languageModel) {
          setError('Prompt API not available. Enable it in chrome://flags');
          return;
        }

        const capabilities = await window.ai.languageModel.capabilities();
        if (capabilities.available === 'no') {
          setError('Language model not available');
          return;
        }

        const aiSession = await window.ai.languageModel.create({
          systemPrompt: SYSTEM_PROMPT
        });
        setSession(aiSession);
      } catch (err) {
        console.error('Failed to initialize AI session:', err);
        setError('Failed to initialize AI: ' + err.message);
      }
    };

    initSession();

    return () => {
      if (session) {
        session.destroy();
      }
    };
  }, []);

  // Auto-fill prompt with selected text
  useEffect(() => {
    if (selectedText && pageContext) {
      setPrompt(`Summarize this text from "${pageContext.pageTitle}":\n\n${selectedText}`);
    }
  }, [selectedText, pageContext]);

  const stripMarkdownCodeBlocks = (text) => {
    if (!text || typeof text !== 'string') return text;
    let cleaned = text.trim();
    cleaned = cleaned.replace(/^```(?:json|javascript|js)?\s*\n?/i, '');
    cleaned = cleaned.replace(/\n?```\s*$/i, '');
    return cleaned.trim();
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !session) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const userPrompt = activeNote
        ? `Current note context:\nTitle: ${activeNote.title}\nContent: ${activeNote.content}\n\nUser request: ${prompt}`
        : prompt;

      const aiResponse = await session.prompt(userPrompt);
      
      console.log('AI Response:', aiResponse);

      // Parse response
      const cleaned = stripMarkdownCodeBlocks(aiResponse);
      let parsed;

      try {
        parsed = JSON.parse(cleaned);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        // Fallback: treat as plain text
        parsed = {
          action: 'expand',
          title: 'AI Generated Note',
          content: aiResponse,
          tags: [],
          keyPoints: []
        };
      }

      setResponse(parsed);

      // Auto-save as note if requested
      if (parsed.content) {
        if (activeNote) {
          // Update existing note
          updateNote(activeNote.id, {
            content: activeNote.content + '\n\n## AI Generated\n\n' + parsed.content,
            tags: [...new Set([...activeNote.tags, ...(parsed.tags || [])])]
          });
        } else {
          // Create new note
          createNote({
            title: parsed.title || 'AI Generated Note',
            content: parsed.content,
            sourceUrl: pageContext?.sourceUrl || '',
            pageTitle: pageContext?.pageTitle || '',
            tags: parsed.tags || [],
            aiGenerated: true
          });
        }
      }

      // Clear selected text after processing
      if (selectedText) {
        clearSelectedText();
      }

      setPrompt('');
    } catch (err) {
      console.error('AI generation error:', err);
      setError('Failed to generate: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
    // Allow backspace/delete to work
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.stopPropagation();
    }
  };

  const quickActions = [
    { label: 'Summarize', action: 'Summarize this text' },
    { label: 'Explain', action: 'Explain this concept in simple terms' },
    { label: 'Expand', action: 'Expand on this with more details' },
    { label: 'Questions', action: 'Generate study questions from this' }
  ];

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>AI Assistant</h3>

      {error && (
        <div style={styles.error}>{error}</div>
      )}

      {pageContext && (
        <div style={styles.context}>
          <div style={styles.contextLabel}>From:</div>
          <div style={styles.contextText}>{pageContext.pageTitle}</div>
        </div>
      )}

      <div style={styles.quickActions}>
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => setPrompt(action.action)}
            style={styles.quickButton}
            disabled={loading}
          >
            {action.label}
          </button>
        ))}
      </div>

      <textarea
        ref={promptRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask AI to help with your notes..."
        style={styles.textarea}
        disabled={loading}
      />

      <button
        onClick={handleGenerate}
        disabled={!prompt.trim() || loading || !session}
        style={{
          ...styles.button,
          ...(loading ? styles.buttonDisabled : {})
        }}
      >
        {loading ? 'Generating...' : 'Generate'}
      </button>

      {response && (
        <div style={styles.response}>
          <div style={styles.responseHeader}>
            <strong>{response.title}</strong>
            {response.action && (
              <span style={styles.badge}>{response.action}</span>
            )}
          </div>
          
          {response.keyPoints && response.keyPoints.length > 0 && (
            <div style={styles.keyPoints}>
              <strong>Key Points:</strong>
              <ul>
                {response.keyPoints.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {response.tags && response.tags.length > 0 && (
            <div style={styles.tags}>
              {response.tags.map((tag, i) => (
                <span key={i} style={styles.tag}>{tag}</span>
              ))}
            </div>
          )}

          <div style={styles.responseNote}>
            ✓ Note {activeNote ? 'updated' : 'created'}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px',
    background: 'rgba(15, 23, 42, 0.95)',
    borderRadius: '12px',
    color: '#e2e8f0'
  },
  heading: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600'
  },
  error: {
    padding: '8px 12px',
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#ef4444'
  },
  context: {
    padding: '8px 12px',
    background: 'rgba(30, 41, 59, 0.5)',
    borderRadius: '8px',
    fontSize: '12px'
  },
  contextLabel: {
    color: 'rgba(226, 232, 240, 0.6)',
    marginBottom: '4px'
  },
  contextText: {
    color: '#60a5fa',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  quickActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  quickButton: {
    padding: '6px 12px',
    background: 'rgba(59, 130, 246, 0.2)',
    border: '1px solid rgba(59, 130, 246, 0.4)',
    borderRadius: '6px',
    color: '#60a5fa',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  textarea: {
    width: '100%',
    minHeight: '80px',
    padding: '10px',
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(148, 163, 184, 0.4)',
    borderRadius: '8px',
    color: '#e2e8f0',
    fontSize: '14px',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  button: {
    padding: '10px',
    background: '#3b82f6',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  buttonDisabled: {
    background: 'rgba(59, 130, 246, 0.5)',
    cursor: 'not-allowed'
  },
  response: {
    padding: '12px',
    background: 'rgba(30, 41, 59, 0.5)',
    borderRadius: '8px',
    fontSize: '13px'
  },
  responseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  badge: {
    padding: '2px 8px',
    background: 'rgba(34, 197, 94, 0.2)',
    borderRadius: '4px',
    fontSize: '11px',
    color: '#4ade80'
  },
  keyPoints: {
    marginBottom: '8px',
    fontSize: '12px'
  },
  tags: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginBottom: '8px'
  },
  tag: {
    padding: '2px 8px',
    background: 'rgba(168, 85, 247, 0.2)',
    borderRadius: '4px',
    fontSize: '11px',
    color: '#c084fc'
  },
  responseNote: {
    fontSize: '11px',
    color: '#4ade80',
    marginTop: '8px'
  }
};

