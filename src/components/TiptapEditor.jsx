import React, { useCallback, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { TextAlign } from "@tiptap/extension-text-align";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";

const TiptapEditor = ({ value, onChange, isReadOnly = false }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value,
    editable: !isReadOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync value from parent if it changes externally (e.g. reset or edit load)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!isReadOnly);
    }
  }, [isReadOnly, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const btn = (isActive) =>
    `w-8 h-8 flex items-center justify-center text-sm border rounded-md transition-all ${
      isActive
        ? "bg-blue-500 text-white border-blue-600 shadow-sm"
        : "bg-white hover:bg-gray-100 border-gray-300"
    }`;

  const handleHeadingChange = (val) => {
    if (!editor) return;
    if (val === "Paragraph") {
      editor.chain().focus().setParagraph().run();
    } else {
      const level = parseInt(val.split(" ")[1]);
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };

  const getCurrentHeading = () => {
    if (!editor) return "Paragraph";
    if (editor.isActive("heading", { level: 1 })) return "Heading 1";
    if (editor.isActive("heading", { level: 2 })) return "Heading 2";
    if (editor.isActive("heading", { level: 3 })) return "Heading 3";
    if (editor.isActive("heading", { level: 4 })) return "Heading 4";
    if (editor.isActive("heading", { level: 5 })) return "Heading 5";
    if (editor.isActive("heading", { level: 6 })) return "Heading 6";
    return "Paragraph";
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-2 flex flex-wrap items-center gap-1">
        <select
          value={getCurrentHeading()}
          onChange={(e) => handleHeadingChange(e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120] bg-white"
          title="Heading Style"
        >
          <option value="Paragraph">Paragraph</option>
          <option value="Heading 1">Heading 1</option>
          <option value="Heading 2">Heading 2</option>
          <option value="Heading 3">Heading 3</option>
          <option value="Heading 4">Heading 4</option>
          <option value="Heading 5">Heading 5</option>
          <option value="Heading 6">Heading 6</option>
        </select>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btn(editor.isActive("bold"))}
          title="Bold (Ctrl+B)"
        >
          <span className="font-bold text-base">B</span>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btn(editor.isActive("italic"))}
          title="Italic (Ctrl+I)"
        >
          <span className="italic text-base">I</span>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={btn(editor.isActive("underline"))}
          title="Underline (Ctrl+U)"
        >
          <span className="underline text-base">U</span>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <div className="flex items-center gap-1">
          <input
            type="color"
            onInput={(e) =>
              editor.chain().focus().setColor(e.target.value).run()
            }
            className="w-7 h-7 p-0 border border-gray-300 rounded cursor-pointer"
            title="Text Color"
          />
          <span className="text-xs text-gray-500">Color</span>
        </div>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={btn(editor.isActive("highlight"))}
          title="Highlight Text"
        >
          <span className="bg-yellow-200 px-1 text-xs">H</span>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <button
          type="button"
          onClick={setLink}
          className={btn(editor.isActive("link"))}
          title="Insert/Edit Link (Select text first)"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.71-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
          </svg>
        </button>

        {editor.isActive("link") && (
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="w-7 h-7 flex items-center justify-center border border-red-300 rounded-md hover:bg-red-50 text-red-600"
            title="Remove Link"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 7h-4v2h4c1.65 0 3 1.35 3 3s-1.35 3-3 3h-4v2h4c2.76 0 5-2.24 5-5s-2.24-5-5-5zm-6 8H7c-1.65 0-3-1.35-3-3s1.35-3 3-3h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-2zm-3-4h8v2H8v-2z" />
            </svg>
          </button>
        )}

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={btn(editor.isActive({ textAlign: "left" }))}
          title="Align Left"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={btn(editor.isActive({ textAlign: "center" }))}
          title="Align Center"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 3h18v2H3V3zm2 4h14v2H5V7zm-2 4h18v2H3v-2zm2 4h14v2H5v-2zm-2 4h18v2H3v-2z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={btn(editor.isActive({ textAlign: "right" }))}
          title="Align Right"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 3h18v2H3V3zm6 4h12v2H9V7zm-6 4h18v2H3v-2zm6 4h12v2H9v-2zm-6 4h18v2H3v-2z" />
          </svg>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={btn(editor.isActive("bulletList"))}
          title="Bullet List"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2zM2 6h1v1H2V6zm0 5h1v1H2v-1zm0 5h1v1H2v-1z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={btn(editor.isActive("orderedList"))}
          title="Numbered List"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2 5h1v2H2V5zm2 0h18v2H4V5zm-2 6h1v2H2v-2zm2 0h18v2H4v-2zm-2 6h1v2H2v-2zm2 0h18v2H4v-2zM3 2h1v1H3V2zm0 3h1v1H3V5zm0 3h1v1H3V8z" />
          </svg>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-100 transition-all"
          title="Undo (Ctrl+Z)"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-100 transition-all"
          title="Redo (Ctrl+Y)"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.4 10.6C16.55 9 14.15 8 11.5 8 6.85 8 2.92 11.03 1.5 15.5l2.37.78C4.95 13.31 7.96 11 11.5 11c1.96 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z" />
          </svg>
        </button>
      </div>

      {/* Editor Area */}
      <div className="p-4 h-[210px] overflow-y-auto prose max-w-none">
        <style>{`
            .ProseMirror { min-height: 210px; outline: none; }
            .ProseMirror h1 { font-size: 2.5em; margin: 0.5em 0; font-weight: bold; }
            .ProseMirror h2 { font-size: 2em; margin: 0.5em 0; font-weight: medium; }
            .ProseMirror h3 { font-size: 1.75em; margin: 0.5em 0; font-weight: medium; }
            .ProseMirror h4 { font-size: 1.5em; margin: 0.5em 0; font-weight: medium; }
            .ProseMirror h5 { font-size: 1.25em; margin: 0.5em 0; font-weight: medium; }
            .ProseMirror h6 { font-size: 1em; margin: 0.5em 0; font-weight: bold; }
            .ProseMirror p { font-size: 15px; margin: 0.5em 0; }
            .ProseMirror ul, .ProseMirror ol { padding-left: 1.5em; }
            .ProseMirror blockquote { border-left: 4px solid #e5e7eb; padding-left: 1em; margin: 1em 0; }
            .ProseMirror a { color: #2563eb; text-decoration: underline; cursor: pointer; }
          `}</style>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TiptapEditor;
