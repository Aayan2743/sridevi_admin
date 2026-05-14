import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

export default function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "min-h-[200px] p-4 prose prose-sm max-w-none focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="border border-[#333] rounded-lg overflow-hidden bg-white">
      {/* TOOLBAR */}
      <div className="flex flex-wrap gap-2 border-b bg-gray-50 p-2 text-sm">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btnStyle(editor.isActive("bold"))}
        >
          Bold
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btnStyle(editor.isActive("italic"))}
        >
          Italic
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={btnStyle(editor.isActive("bulletList"))}
        >
          • List
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={btnStyle(editor.isActive("orderedList"))}
        >
          1. List
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className={btnStyle(false)}
        >
          Undo
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className={btnStyle(false)}
        >
          Redo
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}

function btnStyle(active) {
  return `px-3 py-1 rounded-md transition ${
    active ? "bg-indigo-600 text-white" : "bg-white border hover:bg-gray-100"
  }`;
}

// part -2

// import { useEditor, EditorContent } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";

// import { TextStyle } from "@tiptap/extension-text-style";
// import { Color } from "@tiptap/extension-color";
// import { Highlight } from "@tiptap/extension-highlight";
// import { Image } from "@tiptap/extension-image";
// import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";

// import { Table } from "@tiptap/extension-table";
// import { TableRow } from "@tiptap/extension-table-row";
// import { TableCell } from "@tiptap/extension-table-cell";
// import { TableHeader } from "@tiptap/extension-table-header";

// import { createLowlight } from "lowlight";
// import javascript from "highlight.js/lib/languages/javascript";
// import html from "highlight.js/lib/languages/xml";
// import css from "highlight.js/lib/languages/css";

// import "highlight.js/styles/github.css";
// import { useEffect } from "react";

// /* ---------------- LOWLIGHT SETUP ---------------- */

// const lowlight = createLowlight();
// lowlight.register("javascript", javascript);
// lowlight.register("html", html);
// lowlight.register("css", css);

// /* ---------------- COMPONENT ---------------- */

// export default function RichTextEditor({ value, onChange }) {
//   const editor = useEditor({
//     extensions: [
//       StarterKit.configure({
//         bulletList: {
//           keepMarks: true,
//           keepAttributes: false,
//         },
//         orderedList: {
//           keepMarks: true,
//           keepAttributes: false,
//         },
//       }),
//       TextStyle,
//       Color,
//       Highlight.configure({ multicolor: true }),
//       Image,
//       CodeBlockLowlight.configure({ lowlight }),
//       Table.configure({ resizable: true }),
//       TableRow,
//       TableCell,
//       TableHeader,
//     ],
//     content: value || "",
//     editorProps: {
//       attributes: {
//         class:
//           "min-h-[250px] p-4 prose prose-sm max-w-none focus:outline-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_table]:border-collapse [&_td]:border [&_th]:border [&_td]:p-2 [&_th]:p-2",
//       },
//     },
//     onUpdate: ({ editor }) => {
//       onChange(editor.getHTML());
//     },
//   });

//   useEffect(() => {
//     if (editor && value !== editor.getHTML()) {
//       editor.commands.setContent(value || "");
//     }
//   }, [value, editor]);

//   if (!editor) return null;

//   /* ---------- IMAGE UPLOAD ---------- */

//   const handleImageUpload = (file) => {
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = () => {
//       editor.chain().focus().setImage({ src: reader.result }).run();
//     };
//     reader.readAsDataURL(file);
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     const file = e.dataTransfer.files[0];
//     if (file?.type.startsWith("image/")) {
//       handleImageUpload(file);
//     }
//   };

//   return (
//     <div
//       className="border rounded-xl bg-white shadow-sm overflow-hidden"
//       onDrop={handleDrop}
//       onDragOver={(e) => e.preventDefault()}
//     >
//       {/* ---------------- TOOLBAR ---------------- */}

//       <div className="flex flex-wrap gap-2 border-b bg-gray-50 p-2">
//         <ToolbarBtn
//           active={editor.isActive("bold")}
//           onClick={() => editor.chain().focus().toggleBold().run()}
//         >
//           Bold
//         </ToolbarBtn>

//         <ToolbarBtn
//           active={editor.isActive("italic")}
//           onClick={() => editor.chain().focus().toggleItalic().run()}
//         >
//           Italic
//         </ToolbarBtn>

//         {/* Text Color */}
//         <input
//           type="color"
//           className="w-8 h-8 cursor-pointer"
//           onChange={(e) =>
//             editor.chain().focus().setColor(e.target.value).run()
//           }
//         />

//         {/* Highlight */}
//         <input
//           type="color"
//           className="w-8 h-8 cursor-pointer"
//           onChange={(e) =>
//             editor
//               .chain()
//               .focus()
//               .toggleHighlight({ color: e.target.value })
//               .run()
//           }
//         />

//         {/* Image Upload */}
//         <label className="px-3 py-1 border rounded text-xs cursor-pointer hover:bg-gray-100">
//           Image
//           <input
//             type="file"
//             hidden
//             accept="image/*"
//             onChange={(e) => handleImageUpload(e.target.files[0])}
//           />
//         </label>

//         {/* Code Block */}
//         <ToolbarBtn
//           active={editor.isActive("codeBlock")}
//           onClick={() => editor.chain().focus().toggleCodeBlock().run()}
//         >
//           Code
//         </ToolbarBtn>

//         {/* Insert Table */}
//         <ToolbarBtn
//           onClick={() =>
//             editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()
//           }
//         >
//           Table
//         </ToolbarBtn>

//         {/* Undo / Redo */}
//         <ToolbarBtn onClick={() => editor.chain().focus().undo().run()}>
//           Undo
//         </ToolbarBtn>

//         <ToolbarBtn onClick={() => editor.chain().focus().redo().run()}>
//           Redo
//         </ToolbarBtn>
//       </div>

//       {/* ---------------- EDITOR ---------------- */}

//       <EditorContent editor={editor} />
//     </div>
//   );
// }

// /* ---------------- BUTTON COMPONENT ---------------- */

// function ToolbarBtn({ children, active, onClick }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       className={`px-3 py-1 text-xs rounded transition ${
//         active ? "bg-indigo-600 text-white" : "border hover:bg-gray-100"
//       }`}
//     >
//       {children}
//     </button>
//   );
// }
