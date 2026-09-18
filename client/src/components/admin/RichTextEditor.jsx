import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Heading from '@tiptap/extension-heading'
import CodeBlock from '@tiptap/extension-code-block'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold, Italic, List, ListOrdered, Code, Link2, Heading1, Heading2,
  Heading3, Pilcrow, Minus, Undo2, Redo2, Quote
} from 'lucide-react'

// Toolbar button component
const ToolbarBtn = ({ onClick, active, disabled, title, children }) => (
  <button
    type="button"
    onMouseDown={(e) => { e.preventDefault(); onClick() }}
    disabled={disabled}
    title={title}
    className={`
      p-1.5 rounded-lg text-xs font-mono transition-all
      ${active
        ? 'neu-recessed text-[#ff4757]'
        : 'neu-button text-[#4a5568] hover:text-[#2d3436]'
      }
      disabled:opacity-40 disabled:cursor-not-allowed
    `}
  >
    {children}
  </button>
)

// Divider
const ToolbarDivider = () => (
  <div className="w-px h-5 bg-[#babecc] mx-0.5" />
)

/**
 * RichTextEditor — TipTap-powered WYSIWYG
 * Props:
 *   content: string (HTML or empty string)
 *   onChange: (html: string) => void
 *   placeholder: string
 *   minHeight: string (CSS value, e.g. '200px')
 */
export const RichTextEditor = ({
  content = '',
  onChange,
  placeholder = 'Nhập nội dung bài viết...',
  minHeight = '220px',
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
      }),
      Heading.configure({ levels: [1, 2, 3] }),
      CodeBlock,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-[#ff4757] underline' },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
        style: `min-height: ${minHeight}; padding: 12px;`,
      },
    },
  })

  if (!editor) return null

  const setLink = () => {
    const previous = editor.getAttributes('link').href
    const url = window.prompt('Nhập URL:', previous)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="rounded-xl overflow-hidden border border-[#babecc]/60 neu-recessed-deep">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-[#d1d9e6] border-b border-[#babecc]/60">
        {/* Text style */}
        <span className="text-[9px] font-mono text-[#8892a4] uppercase tracking-widest mr-1">FORMAT</span>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Inline Code"
        >
          <Code className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <ToolbarDivider />

        {/* Headings */}
        <span className="text-[9px] font-mono text-[#8892a4] uppercase tracking-widest mr-1">HDR</span>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <ToolbarDivider />

        {/* Lists */}
        <span className="text-[9px] font-mono text-[#8892a4] uppercase tracking-widest mr-1">LIST</span>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Ordered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <ToolbarDivider />

        {/* Block */}
        <span className="text-[9px] font-mono text-[#8892a4] uppercase tracking-widest mr-1">BLOCK</span>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          title="Code Block"
        >
          <span className="text-[10px] font-mono font-bold">{'{}'}</span>
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Divider"
        >
          <Minus className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={editor.isActive('paragraph')}
          title="Paragraph"
        >
          <Pilcrow className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={setLink} active={editor.isActive('link')} title="Insert Link">
          <Link2 className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <ToolbarDivider />

        {/* History */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </ToolbarBtn>

        {/* Word count */}
        <div className="ml-auto text-[9px] font-mono text-[#8892a4]">
          {editor.storage.characterCount?.characters?.() ?? 0} CHARS
        </div>
      </div>

      {/* Editor content area */}
      <div
        className="bg-[#f0f2f5] cursor-text"
        onClick={() => editor.commands.focus()}
      >
        <style>{`
          .tiptap.is-editor-empty::before {
            content: attr(data-placeholder);
            float: left;
            color: #8892a4;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.75rem;
            pointer-events: none;
            height: 0;
          }
          .tiptap h1 { font-size: 1.4rem; font-weight: 800; margin: 0.8em 0 0.4em; color: #2d3436; }
          .tiptap h2 { font-size: 1.15rem; font-weight: 700; margin: 0.7em 0 0.3em; color: #2d3436; }
          .tiptap h3 { font-size: 1rem; font-weight: 600; margin: 0.6em 0 0.3em; color: #4a5568; }
          .tiptap p { margin: 0.4em 0; font-size: 0.8rem; color: #4a5568; line-height: 1.6; }
          .tiptap ul, .tiptap ol { padding-left: 1.2em; margin: 0.4em 0; }
          .tiptap li { font-size: 0.8rem; color: #4a5568; margin: 0.15em 0; }
          .tiptap ul li { list-style: disc; }
          .tiptap ol li { list-style: decimal; }
          .tiptap blockquote { border-left: 3px solid #ff4757; padding-left: 0.8em; color: #8892a4; font-style: italic; margin: 0.5em 0; }
          .tiptap code { background: #d1d9e6; color: #ff4757; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; padding: 0.1em 0.3em; border-radius: 4px; }
          .tiptap pre { background: #2d3436; color: #2ed573; border-radius: 8px; padding: 12px; margin: 0.6em 0; overflow-x: auto; }
          .tiptap pre code { background: none; color: inherit; font-size: 0.75rem; padding: 0; }
          .tiptap hr { border: none; border-top: 2px solid #babecc; margin: 0.8em 0; }
          .tiptap a { color: #ff4757; text-decoration: underline; }
        `}</style>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
