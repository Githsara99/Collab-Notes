import React, { useState, useEffect, useCallback } from 'react';
import RichEditor from '../editor/RichEditor';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const COLORS = ['#1e1e2e','#2d1b4e','#1a2d1a','#2d2a1a','#1a1f2d','#2d1a1a','#2d261a','#1a2a2d'];
const COLOR_LABELS = ['Default','Purple','Green','Yellow','Blue','Red','Orange','Teal'];

export default function NoteModal({ note, onClose, onSaved, currentUserId }) {
  const isNew = !note?._id;
  const isOwner = isNew || note?.owner?._id === currentUserId || note?.owner === currentUserId;
  const collab = !isNew && note?.collaborators?.find(c => c.user?._id === currentUserId || c.user === currentUserId);
  const canWrite = isOwner || collab?.permission === 'write';

  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState(note?.tags?.join(', ') || '');
  const [color, setColor] = useState(note?.color || '#1e1e2e');
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('edit'); // edit | collab
  const [collabEmail, setCollabEmail] = useState('');
  const [collabPerm, setCollabPerm] = useState('read');
  const [addingCollab, setAddingCollab] = useState(false);
  const [noteData, setNoteData] = useState(note);

  const handleSave = async () => {
    if (!title.trim()) return toast.error('Title is required');
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        content,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        color
      };
      let res;
      if (isNew) {
        res = await api.post('/notes', payload);
      } else {
        res = await api.put(`/notes/${note._id}`, payload);
      }
      toast.success(isNew ? 'Note created!' : 'Note saved!');
      onSaved(res.data.note);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCollab = async () => {
    if (!collabEmail.trim()) return;
    setAddingCollab(true);
    try {
      const res = await api.post(`/notes/${noteData._id}/collaborators`, { email: collabEmail.trim(), permission: collabPerm });
      setNoteData(res.data.note);
      setCollabEmail('');
      toast.success('Collaborator added!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add collaborator');
    } finally {
      setAddingCollab(false);
    }
  };

  const handleRemoveCollab = async (userId) => {
    try {
      const res = await api.delete(`/notes/${noteData._id}/collaborators/${userId}`);
      setNoteData(res.data.note);
      toast.success('Collaborator removed');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to remove collaborator');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 fade-in" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-surface w-full max-w-3xl rounded-2xl border border-border flex flex-col" style={{ height: '85vh' }}>
        
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          {canWrite && (
            <input
              value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Note title..."
              className="flex-1 bg-transparent text-white text-lg font-semibold placeholder-text-dim focus:outline-none"
            />
          )}
          {!canWrite && <h2 className="flex-1 text-white text-lg font-semibold">{title}</h2>}

          <div className="flex items-center gap-2">
            {/* Tabs */}
            {!isNew && (
              <>
                <button onClick={() => setTab('edit')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === 'edit' ? 'bg-accent text-white' : 'text-text-muted hover:text-white'}`}>Edit</button>
                {isOwner && <button onClick={() => setTab('collab')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === 'collab' ? 'bg-accent text-white' : 'text-text-muted hover:text-white'}`}>Collaborators {noteData?.collaborators?.length > 0 && `(${noteData.collaborators.length})`}</button>}
              </>
            )}
            {canWrite && (
              <button onClick={handleSave} disabled={saving}
                className="bg-accent hover:bg-accent-dark text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            )}
            <button onClick={onClose} className="text-text-muted hover:text-white p-1.5 rounded-lg hover:bg-surface-200 transition-colors">✕</button>
          </div>
        </div>

        {/* Body */}
        {tab === 'edit' ? (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-hidden">
              <RichEditor content={content} onChange={setContent} readOnly={!canWrite} />
            </div>

            {canWrite && (
              <div className="p-4 border-t border-border bg-base-100 flex flex-wrap items-center gap-4">
                {/* Tags */}
                <div className="flex items-center gap-2 flex-1 min-w-40">
                  <span className="text-text-dim text-xs">Tags:</span>
                  <input
                    value={tags} onChange={e => setTags(e.target.value)}
                    placeholder="tag1, tag2, tag3"
                    className="flex-1 bg-surface-200 border border-border rounded px-2 py-1 text-xs text-white placeholder-text-dim focus:outline-none focus:border-accent"
                  />
                </div>
                {/* Colors */}
                <div className="flex items-center gap-1.5">
                  <span className="text-text-dim text-xs">Color:</span>
                  {COLORS.map((c, i) => (
                    <button key={c} onClick={() => setColor(c)} title={COLOR_LABELS[i]}
                      className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                      style={{ background: c === '#1e1e2e' ? '#3a3a60' : c }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Collaborators tab
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Add Collaborator</h3>
              <div className="flex gap-2">
                <input
                  value={collabEmail} onChange={e => setCollabEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="flex-1 bg-base-200 border border-border rounded-lg px-3 py-2 text-sm text-white placeholder-text-dim focus:outline-none focus:border-accent"
                />
                <select value={collabPerm} onChange={e => setCollabPerm(e.target.value)}
                  className="bg-base-200 border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                  <option value="read">Read</option>
                  <option value="write">Write</option>
                </select>
                <button onClick={handleAddCollab} disabled={addingCollab}
                  className="bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  Add
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Current Collaborators</h3>
              {noteData?.collaborators?.length === 0 ? (
                <p className="text-text-muted text-sm">No collaborators yet.</p>
              ) : (
                <div className="space-y-2">
                  {noteData?.collaborators?.map(c => (
                    <div key={c.user?._id} className="flex items-center justify-between bg-base-200 rounded-lg px-3 py-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center text-sm font-semibold text-accent-light">
                          {c.user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm text-white">{c.user?.name}</p>
                          <p className="text-xs text-text-muted">{c.user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${c.permission === 'write' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {c.permission}
                        </span>
                        <button onClick={() => handleRemoveCollab(c.user?._id)}
                          className="text-text-muted hover:text-red-400 transition-colors text-xs p-1">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
