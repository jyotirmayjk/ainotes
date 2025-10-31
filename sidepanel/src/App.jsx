import { useEffect, useState } from 'react';
import useNotesStore from './state/notesStore';
import NoteEditor from './components/NoteEditor';
import AIAssistant from './components/AIAssistant';
import './App.css';

function App() {
  const { initFromStorage, setSelectedText } = useNotesStore();
  const [showAI, setShowAI] = useState(true);

  // Initialize from storage on mount
  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  // Listen for messages from background/content scripts
  useEffect(() => {
    const messageListener = (message) => {
      if (message.type === 'SELECTED_TEXT') {
        setSelectedText(message.text, {
          sourceUrl: message.sourceUrl,
          pageTitle: message.pageTitle,
          timestamp: message.timestamp
        });
        setShowAI(true);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, [setSelectedText]);

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.title}>AI Notes</h1>
        <button
          onClick={() => setShowAI(!showAI)}
          style={styles.toggleButton}
        >
          {showAI ? 'Hide' : 'Show'} AI
        </button>
      </header>

      <div style={styles.content}>
        <NoteEditor />
      </div>

      {showAI && (
        <div style={styles.aiPanel}>
          <AIAssistant />
        </div>
      )}
    </div>
  );
}

const styles = {
  app: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: '#0f172a',
    color: '#e2e8f0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'rgba(30, 41, 59, 0.8)',
    borderBottom: '1px solid rgba(148, 163, 184, 0.2)'
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  toggleButton: {
    padding: '6px 12px',
    background: 'rgba(59, 130, 246, 0.2)',
    border: '1px solid rgba(59, 130, 246, 0.4)',
    borderRadius: '6px',
    color: '#60a5fa',
    fontSize: '12px',
    cursor: 'pointer'
  },
  content: {
    flex: 1,
    overflow: 'hidden'
  },
  aiPanel: {
    borderTop: '1px solid rgba(148, 163, 184, 0.2)',
    background: 'rgba(15, 23, 42, 0.95)'
  }
};

export default App;

