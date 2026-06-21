import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNotesStore } from '../stores/notesStore';
import { Plus, Trash2, Pencil } from 'lucide-react';

export const NotesPage: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote } = useNotesStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    if (editingId) {
      updateNote(editingId, { title: title.trim(), content: content.trim() });
      setEditingId(null);
    } else {
      addNote({ title: title.trim(), content: content.trim(), tags: [] });
    }
    setTitle('');
    setContent('');
  };

  const handleEdit = (id: string) => {
    const note = notes.find((item) => item.id === id);
    if (!note) return;
    setTitle(note.title);
    setContent(note.content);
    setEditingId(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-text-muted mb-2">Notes & study resources</p>
          <h1 className="text-3xl font-semibold text-text-primary">Capture ideas, summaries, and reference notes</h1>
        </div>
        <div className="rounded-3xl border border-border-subtle bg-bg-elevated px-4 py-3 text-sm text-text-secondary">
          Saved notes <span className="font-semibold text-text-primary">{notes.length}</span>
        </div>
      </div>

      <motion.section className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-lg font-semibold text-text-primary">Quick note capture</h2>
        <p className="mt-2 text-sm text-text-secondary">Save key facts, formulas, and task-related ideas for later review.</p>

        <form onSubmit={handleSave} className="grid gap-4 mt-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className="w-full rounded-2xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="Write your note here"
            className="w-full rounded-3xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 resize-none"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-on-dark transition hover:bg-accent-hover"
          >
            <Plus size={14} /> {editingId ? 'Update Note' : 'Save Note'}
          </button>
        </form>
      </motion.section>

      <section className="grid gap-4 md:grid-cols-2">
        {notes.length === 0 ? (
          <div className="card border-dashed border-border-subtle py-12 text-center text-text-muted bg-bg-surface">
            No notes yet. Use this space to save quick study summaries and launch plans.
          </div>
        ) : (
          notes.map((note) => (
            <motion.article
              key={note.id}
              className="card border-border-subtle bg-bg-surface p-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">{note.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-text-secondary whitespace-pre-line">{note.content}</p>
                </div>
                <div className="flex flex-col gap-2 text-text-secondary">
                  <button
                    type="button"
                    onClick={() => handleEdit(note.id)}
                    className="rounded-2xl border border-border-subtle bg-bg-elevated px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-surface"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteNote(note.id)}
                    className="rounded-2xl border border-border-subtle bg-bg-elevated px-3 py-2 text-xs text-danger-color hover:text-on-dark hover:bg-bg-surface"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </motion.article>
          ))
        )}
      </section>
    </div>
  );
};
