/**
 * EditorToolbar Component
 * Rich text editing toolbar for resume editor with formatting options
 */

'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Undo,
  Redo,
  Type,
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor | null;
  wordCount?: number;
  charCount?: number;
}

export function EditorToolbar({ editor, wordCount = 0, charCount = 0 }: EditorToolbarProps) {
  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    isActive,
    disabled,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        p-2 rounded transition-colors
        ${isActive ? 'bg-gold-500/20 text-gold-400' : 'text-gray-300 hover:bg-white/10'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  );

  const FontSizeSelect = () => (
    <select
      value={editor.getAttributes('textStyle').fontSize || '11pt'}
      onChange={(e) => {
        if (e.target.value === 'default') {
          editor.chain().focus().unsetFontSize().run();
        } else {
          editor.chain().focus().setMark('textStyle', { fontSize: e.target.value }).run();
        }
      }}
      className="bg-black/40 text-white border border-gold-500/30 rounded px-2 py-1 text-sm"
      title="Font Size"
    >
      <option value="default">Font Size</option>
      <option value="10pt">10pt</option>
      <option value="10.5pt">10.5pt</option>
      <option value="11pt">11pt (Body)</option>
      <option value="11.5pt">11.5pt</option>
      <option value="12pt">12pt (Header)</option>
      <option value="13pt">13pt</option>
      <option value="14pt">14pt</option>
    </select>
  );

  return (
    <div className="bg-black/60 border border-gold-500/30 rounded-lg p-3 mb-4 backdrop-blur-sm">
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r border-white/10 pr-3">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
          >
            <Bold size={18} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
          >
            <Italic size={18} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline (Ctrl+U)"
          >
            <Underline size={18} />
          </ToolbarButton>
        </div>

        {/* Font Size */}
        <div className="flex items-center gap-2 border-r border-white/10 pr-3">
          <Type size={18} className="text-gray-400" />
          <FontSizeSelect />
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 border-r border-white/10 pr-3">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            <AlignLeft size={18} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
          >
            <AlignCenter size={18} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            <AlignRight size={18} />
          </ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r border-white/10 pr-3">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List size={18} />
          </ToolbarButton>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-1 border-r border-white/10 pr-3">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
          >
            <Undo size={18} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Y)"
          >
            <Redo size={18} />
          </ToolbarButton>
        </div>

        {/* Word/Character Count */}
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span title="Word Count">{wordCount} words</span>
          <span title="Character Count">{charCount} chars</span>
        </div>
      </div>
    </div>
  );
}
