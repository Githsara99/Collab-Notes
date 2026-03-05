import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';

const ToolBtn = ({ onClick, active, title, children }) => (
  <button type="button" onClick={onClick} title={title}
    className={`p-1.5 rounded text-sm transition-colors ${active ? 'bg-accent text-white' : 'text-text-muted hover:text-white hover:bg-surface-200'}`}>
    {children}
  </button>
);

export default function RichEditor({ content, onChange, readOnly = false }) {
  const editor = useEditor({
    extensions: [
      StarterKit, Underline, Highlight.configure({ multicolor: true }),
      TaskList, TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Start writing your note...' }),
      TextStyle, Color
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => onChange && onChange(editor.getHTML()),
  });

  if (!editor) return null;

  const btn = (label, action, active) => (
    <ToolBtn onClick={action} active={active} title={label}>{label}</ToolBtn>
  );

  return (
    <div className="flex flex-col h-full">
      {!readOnly && (
        <div className="flex flex-wrap gap-0.5 p-2 border-b border-border bg-surface sticky top-0 z-10">
          <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
            <strong>B</strong>
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
            <em>I</em>
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
            <u>U</u>
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strike">
            <s>S</s>
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight">
            H
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline Code">
            {'<>'}
          </ToolBtn>
          <div className="w-px bg-border mx-1" />
          <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="H1">H1</ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="H2">H2</ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="H3">H3</ToolBtn>
          <div className="w-px bg-border mx-1" />
          <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">• List</ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List">1. List</ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} title="Task List">☑ Tasks</ToolBtn>
          <div className="w-px bg-border mx-1" />
          <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote">"Quote"</ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code Block">Code</ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">─</ToolBtn>
          <div className="w-px bg-border mx-1" />
          <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">↩</ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">↪</ToolBtn>
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}
