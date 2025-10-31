import { create } from 'zustand';
import { nanoid } from 'nanoid';

const useNotesStore = create((set, get) => ({
  notes: [],
  activeNoteId: null,
  selectedText: null,
  pageContext: null,

  // Initialize from chrome.storage
  initFromStorage: async () => {
    try {
      const result = await chrome.storage.local.get(['notes', 'activeNoteId', 'lastSelection']);
      set({
        notes: result.notes || [],
        activeNoteId: result.activeNoteId || null,
        selectedText: result.lastSelection?.text || null,
        pageContext: result.lastSelection || null
      });
    } catch (error) {
      console.error('Failed to load from storage:', error);
    }
  },

  // Persist to chrome.storage
  persistToStorage: async () => {
    const { notes, activeNoteId } = get();
    try {
      await chrome.storage.local.set({ notes, activeNoteId });
    } catch (error) {
      console.error('Failed to persist to storage:', error);
    }
  },

  // Create a new note
  createNote: (noteData) => {
    const newNote = {
      id: nanoid(),
      title: noteData.title || 'Untitled Note',
      content: noteData.content || '',
      sourceUrl: noteData.sourceUrl || '',
      pageTitle: noteData.pageTitle || '',
      timestamp: Date.now(),
      tags: noteData.tags || [],
      aiGenerated: noteData.aiGenerated || false,
      ...noteData
    };

    set((state) => ({
      notes: [...state.notes, newNote],
      activeNoteId: newNote.id
    }));

    get().persistToStorage();
    return newNote.id;
  },

  // Update an existing note
  updateNote: (id, updates) => {
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, ...updates, timestamp: Date.now() } : note
      )
    }));
    get().persistToStorage();
  },

  // Delete a note
  deleteNote: (id) => {
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
      activeNoteId: state.activeNoteId === id ? null : state.activeNoteId
    }));
    get().persistToStorage();
  },

  // Set active note
  setActiveNote: (id) => {
    set({ activeNoteId: id });
    get().persistToStorage();
  },

  // Get active note
  getActiveNote: () => {
    const { notes, activeNoteId } = get();
    return notes.find((note) => note.id === activeNoteId) || null;
  },

  // Set selected text from page
  setSelectedText: (text, context) => {
    set({ selectedText: text, pageContext: context });
  },

  // Clear selected text
  clearSelectedText: () => {
    set({ selectedText: null, pageContext: null });
  },

  // Search notes
  searchNotes: (query) => {
    const { notes } = get();
    const lowerQuery = query.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(lowerQuery) ||
        note.content.toLowerCase().includes(lowerQuery) ||
        note.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  },

  // Get notes by tag
  getNotesByTag: (tag) => {
    const { notes } = get();
    return notes.filter((note) => note.tags.includes(tag));
  },

  // Get all unique tags
  getAllTags: () => {
    const { notes } = get();
    const tagsSet = new Set();
    notes.forEach((note) => note.tags.forEach((tag) => tagsSet.add(tag)));
    return Array.from(tagsSet);
  }
}));

export default useNotesStore;

