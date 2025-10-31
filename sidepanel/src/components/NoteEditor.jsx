import { useEffect, useRef, useState } from 'react';
import useNotesStore from '../state/notesStore';

export default function NoteEditor() {
  const { notes, activeNoteId, getActiveNote, updateNote, createNote, deleteNote, setActiveNote } = useNotesStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const contentRef = useRef(null);

  const activeNote = getActiveNote();

  // Load active note
  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [activeNoteId, activeNote]);

  // Auto-save on content change
  useEffect(() => {
    if (activeNote && (title !== activeNote.title || content !== activeNote.content)) {
      const timer = setTimeout(() => {
        updateNote(activeNote.id, { title, content });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [title, content, activeNote, updateNote]);

  const handleNewNote = () => {
    const newId = createNote({
      title: 'New Note',
      content: ''
    });
    setActiveNote(newId);
  };

  const handleDeleteNote = () => {
    if (activeNote && confirm('Delete this note?')) {
      deleteNote(activeNote.id);
    }
  };

  return (
    <div style={styles.container}>
      {/* Notes list */}
      <div style={styles.sidebar}>
        <button onClick={handleNewNote} style={styles.newButton}>
          + New Note
        </button>
        <div style={styles.notesList}>
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => setActiveNote(note.id)}
              style={{
                ...styles.noteItem,
                ...(activeNoteId === note.id ? styles.noteItemActive : {})
              }}
            >
              <div style={styles.noteTitle}>{note.title}</div>
              <div style={styles.notePreview}>
                {note.content.substring(0, 60)}...
              </div>
              <div style={styles.noteTimestamp}>
                {new Date(note.timestamp).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div style={styles.editor}>
        {activeNote ? (
          <>
            <div style={styles.editorHeader}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title"
                style={styles.titleInput}
              />
              <button onClick={handleDeleteNote} style={styles.deleteButton}>
                Delete
              </button>
            </div>

            {activeNote.sourceUrl && (
              <div style={styles.sourceInfo}>
                <a href={activeNote.sourceUrl} target="_blank" rel="noopener noreferrer" style={styles.sourceLink}>
                  {activeNote.pageTitle || activeNote.sourceUrl}
                </a>
              </div>
            )}

            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing..."
              style={styles.contentTextarea}
            />
          </>
        ) : (
          <div style={styles.emptyState}>
            <p>Select a note or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: '100%',
    background: '#0f172a',
    color: '#e2e8f0'
  },
  sidebar: {
    width: '200px',
    borderRight: '1px solid rgba(148, 163, 184, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    padding: '12px'
  },
  newButton: {
    padding: '8px 12px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    marginBottom: '12px'
  },
  notesList: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  noteItem: {
    padding: '12px',
    background: 'rgba(30, 41, 59, 0.5)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  noteItemActive: {
    background: 'rgba(59, 130, 246, 0.2)',
    borderLeft: '3px solid #3b82f6'
  },
  noteTitle: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  notePreview: {
    fontSize: '12px',
    color: 'rgba(226, 232, 240, 0.6)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginBottom: '4px'
  },
  noteTimestamp: {
    fontSize: '11px',
    color: 'rgba(226, 232, 240, 0.5)'
  },
  editor: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '16px'
  },
  editorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  titleInput: {
    flex: 1,
    fontSize: '20px',
    fontWeight: '600',
    background: 'transparent',
    border: 'none',
    color: '#e2e8f0',
    outline: 'none',
    padding: '8px 0'
  },
  deleteButton: {
    padding: '6px 12px',
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  sourceInfo: {
    marginBottom: '16px',
    padding: '8px 12px',
    background: 'rgba(30, 41, 59, 0.5)',
    borderRadius: '8px',
    fontSize: '12px'
  },
  sourceLink: {
    color: '#60a5fa',
    textDecoration: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'block'
  },
  contentTextarea: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#e2e8f0',
    fontSize: '14px',
    lineHeight: '1.6',
    resize: 'none',
    outline: 'none',
    fontFamily: 'inherit'
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(226, 232, 240, 0.5)'
  }
};

