import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import NoteCard from '../components/notes/NoteCard';
import NoteModal from '../components/notes/NoteModal';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState({ pinned: false, archived: false, tag: '' });
  const [allTags, setAllTags] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null); // null = closed, {} = new, {...note} = edit
  const [modalOpen, setModalOpen] = useState(false);
  const searchTimer = useRef(null);

  const fetchNotes = useCallback(async (pg = 1, searchVal = search) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 12 };
      if (searchVal) params.search = searchVal;
      if (filter.pinned) params.pinned = true;
      if (filter.archived) params.archived = true;
      if (filter.tag) params.tag = filter.tag;
      const res = await api.get('/notes', { params });
      if (pg === 1) {
        setNotes(res.data.notes);
      } else {
        setNotes(prev => [...prev, ...res.data.notes]);
      }
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
      setPage(pg);
      // Collect unique tags
      const tags = new Set();
      res.data.notes.forEach(n => n.tags?.forEach(t => tags.add(t)));
      if (pg === 1) setAllTags([...tags]);
    } catch (err) {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => { fetchNotes(1); }, [filter]);

  const handleSearchChange = (val) => {
    setSearchInput(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearch(val);
      fetchNotes(1, val);
    }, 400);
  };

  const handlePin = async (note) => {
    try {
      const res = await api.put(`/notes/${note._id}`, { isPinned: !note.isPinned });
      setNotes(prev => prev.map(n => n._id === note._id ? res.data.note : n));
    } catch (err) {
      toast.error('Failed to update note');
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Delete this note permanently?')) return;
    try {
      await api.delete(`/notes/${noteId}`);
      setNotes(prev => prev.filter(n => n._id !== noteId));
      setTotal(t => t - 1);
      toast.success('Note deleted');
    } catch (err) {
      toast.error('Failed to delete note');
    }
  };

  const handleNoteSaved = (savedNote) => {
    setNotes(prev => {
      const exists = prev.find(n => n._id === savedNote._id);
      if (exists) return prev.map(n => n._id === savedNote._id ? savedNote : n);
      return [savedNote, ...prev];
    });
    setModalOpen(false);
    setSelectedNote(null);
  };

  const openNew = () => { setSelectedNote({}); setModalOpen(true); };
  const openNote = (note) => { setSelectedNote(note); setModalOpen(true); };

  const pinned = notes.filter(n => n.isPinned);
  const unpinned = notes.filter(n => !n.isPinned);

  return (
    <div className="min-h-screen bg-base flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border bg-base-100 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><polyline points="14 2 14 8 20 8" stroke="white" fill="none" strokeWidth="1.5"/></svg>
            </div>
            <span className="font-bold text-white text-sm">CollabNotes</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="p-3 flex-1">
          <p className="text-text-dim text-xs font-semibold uppercase tracking-wider mb-2 px-2">Views</p>
          {[
            { label: 'All Notes', icon: '📄', key: '' },
            { label: 'Pinned', icon: '📌', key: 'pinned' },
            { label: 'Archived', icon: '📦', key: 'archived' },
          ].map(item => (
            <button key={item.key} onClick={() => {
              setFilter({ pinned: item.key === 'pinned', archived: item.key === 'archived', tag: '' });
              setSearch(''); setSearchInput('');
            }}
              className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors mb-0.5
                ${(item.key === '' && !filter.pinned && !filter.archived && !filter.tag) ||
                  (item.key === 'pinned' && filter.pinned) ||
                  (item.key === 'archived' && filter.archived)
                  ? 'bg-accent/20 text-accent-light'
                  : 'text-text-muted hover:text-white hover:bg-surface-200'}`}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}

          {allTags.length > 0 && (
            <div className="mt-4">
              <p className="text-text-dim text-xs font-semibold uppercase tracking-wider mb-2 px-2">Tags</p>
              {allTags.map(tag => (
                <button key={tag} onClick={() => setFilter(f => ({ ...f, tag: f.tag === tag ? '' : tag }))}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors mb-0.5 ${filter.tag === tag ? 'bg-accent/20 text-accent-light' : 'text-text-muted hover:text-white hover:bg-surface-200'}`}>
                  <span>#</span>{tag}
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center text-sm font-semibold text-accent-light">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{user?.name}</p>
              <p className="text-text-dim text-xs truncate">{user?.email}</p>
            </div>
            <button onClick={logout} className="text-text-dim hover:text-white text-xs p-1 rounded transition-colors" title="Sign out">→</button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center gap-4 px-6 py-4 border-b border-border">
          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim">🔍</span>
            <input
              value={searchInput} onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-text-dim focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <span className="text-text-dim text-sm">{total} note{total !== 1 ? 's' : ''}</span>
          <button onClick={openNew}
            className="bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5">
            <span>+</span> New Note
          </button>
        </header>

        {/* Notes grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && notes.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-text-muted">Loading notes...</div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-center">
              <div className="text-4xl mb-3">📝</div>
              <h3 className="text-white font-medium mb-1">{search ? 'No notes match your search' : 'No notes yet'}</h3>
              <p className="text-text-muted text-sm mb-4">{search ? 'Try different keywords' : 'Create your first note to get started'}</p>
              {!search && <button onClick={openNew} className="bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Create Note</button>}
            </div>
          ) : (
            <>
              {pinned.length > 0 && (
                <div className="mb-6">
                  <p className="text-text-dim text-xs font-semibold uppercase tracking-wider mb-3">📌 Pinned</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {pinned.map(note => (
                      <NoteCard key={note._id} note={note} onClick={() => openNote(note)}
                        onPin={() => handlePin(note)} onDelete={() => handleDelete(note._id)}
                        currentUserId={user?._id} />
                    ))}
                  </div>
                </div>
              )}
              {unpinned.length > 0 && (
                <div>
                  {pinned.length > 0 && <p className="text-text-dim text-xs font-semibold uppercase tracking-wider mb-3">Other Notes</p>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {unpinned.map(note => (
                      <NoteCard key={note._id} note={note} onClick={() => openNote(note)}
                        onPin={() => handlePin(note)} onDelete={() => handleDelete(note._id)}
                        currentUserId={user?._id} />
                    ))}
                  </div>
                </div>
              )}
              {page < totalPages && (
                <div className="flex justify-center mt-6">
                  <button onClick={() => fetchNotes(page + 1)} disabled={loading}
                    className="bg-surface hover:bg-surface-200 border border-border text-white px-6 py-2 rounded-lg text-sm transition-colors disabled:opacity-50">
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Modal */}
      {modalOpen && (
        <NoteModal
          note={selectedNote?._id ? selectedNote : null}
          onClose={() => { setModalOpen(false); setSelectedNote(null); }}
          onSaved={handleNoteSaved}
          currentUserId={user?._id}
        />
      )}
    </div>
  );
}
