/**
 * ResumeSectionEditor Component
 * Editable resume section with TipTap rich text editor
 */

'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { EditorToolbar } from './EditorToolbar';
import { GripVertical, Trash2 } from 'lucide-react';

interface ResumeSectionEditorProps {
  sectionName: string;
  content: string;
  onChange: (content: string) => void;
  onDelete?: () => void;
  dragHandleProps?: any;
  placeholder?: string;
}

export function ResumeSectionEditor({
  sectionName,
  content,
  onChange,
  onDelete,
  dragHandleProps,
  placeholder = 'Start typing...',
}: ResumeSectionEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
        defaultAlignment: 'left',
      }),
      Underline,
      TextStyle,
      Color,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[100px] p-4',
      },
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Calculate word and character count
  const text = editor?.getText() || '';
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  const charCount = text.length;

  return (
    <div className="bg-black/40 border border-gold-500/30 rounded-lg overflow-hidden mb-4">
      {/* Section Header */}
      <div className="flex items-center justify-between bg-black/60 border-b border-gold-500/30 px-4 py-3">
        <div className="flex items-center gap-3">
          {dragHandleProps && (
            <button
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gold-400 transition-colors"
              title="Drag to reorder"
            >
              <GripVertical size={20} />
            </button>
          )}
          <h3 className="text-lg font-semibold text-gold-400">{sectionName}</h3>
        </div>

        {onDelete && (
          <button
            onClick={onDelete}
            className="text-red-400 hover:text-red-300 transition-colors p-2 rounded hover:bg-red-500/10"
            title="Delete Section"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="px-4 pt-4">
        <EditorToolbar editor={editor} wordCount={wordCount} charCount={charCount} />
      </div>

      {/* Editor Content */}
      <div className="px-4 pb-4">
        <div className="bg-white/5 border border-white/10 rounded-lg">
          <EditorContent
            editor={editor}
            placeholder={placeholder}
            className="resume-editor"
          />
        </div>
      </div>
    </div>
  );
}
