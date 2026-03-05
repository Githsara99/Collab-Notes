import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const stripHtml = (html) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

const COLORS = ['#1e1e2e','#2d1b4e','#1a2d1a','#2d2a1a','#1a1f2d','#2d1a1a'];

export default function NoteCard({ note, onClick, onPin, onDelete, currentUserId }) {
  const isOwner = note.owner?._id === currentUserId || note.owner === currentUserId;
  const preview = stripHtml(note.content).slice(0, 120);
  const timeAgo = formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true });

  return (
    <div onClick={onClick} className="group relative rounded-xl border border-border hover:border-border-light transition-all cursor-pointer fade-in overflow-hidden"
      style={{ background: note.color && note.color !== '#1e1e2e' ? note.color + '22' : '#1e1e2e' }}>
      
      {/* Color accent bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: note.color || '#7c3aed' }} />
      
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 flex-1">{note.title}</h3>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {isOwner && (
              <button onClick={e => { e.stopPropagation(); onPin(); }}
                className="p-1 rounded hover:bg-surface-200 text-text-muted hover:text-accent transition-colors"
                title={note.isPinned ? 'Unpin' : 'Pin'}>
                {note.isPinned ? '📌' : '📎'}
              </button>
            )}
            {isOwner && (
              <button onClick={e => { e.stopPropagation(); onDelete(); }}
                className="p-1 rounded hover:bg-surface-200 text-text-muted hover:text-red-400 transition-colors" title="Delete">
                🗑
              </button>
            )}
          </div>
        </div>

        {/* Preview */}
        {preview && <p className="text-text-muted text-xs line-clamp-3 mb-3 leading-relaxed">{preview}</p>}

        {/* Tags */}
        {note.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {note.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs bg-accent/20 text-accent-light px-2 py-0.5 rounded-full">#{tag}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Collaborators avatars */}
            {note.collaborators?.slice(0, 3).map((c, i) => (
              <div key={i} className="w-5 h-5 rounded-full bg-accent/30 flex items-center justify-center text-xs text-accent-light border border-border" title={c.user?.name}>
                {c.user?.name?.[0]?.toUpperCase()}
              </div>
            ))}
            {note.collaborators?.length > 3 && (
              <span className="text-xs text-text-dim">+{note.collaborators.length - 3}</span>
            )}
          </div>
          <span className="text-xs text-text-dim">{timeAgo}</span>
        </div>
      </div>

      {note.isPinned && (
        <div className="absolute top-2 right-2 text-xs">📌</div>
      )}
    </div>
  );
}
