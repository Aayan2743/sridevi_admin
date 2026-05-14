// import { useEditor, EditorContent } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import { TextStyle } from "@tiptap/extension-text-style";
// import { Color } from "@tiptap/extension-color";
// import { Highlight } from "@tiptap/extension-highlight";
// import { Image } from "@tiptap/extension-image";
// import { Table } from "@tiptap/extension-table";
// import { TableRow } from "@tiptap/extension-table-row";
// import { TableCell } from "@tiptap/extension-table-cell";
// import { TableHeader } from "@tiptap/extension-table-header";
// import { useEffect } from "react";

// export default function RichTextEditorNew({ value, onChange }) {

//   const editor = useEditor({
//     extensions: [
//       StarterKit,
//       TextStyle,
//       Color,
//       Highlight.configure({ multicolor: true }),
//       Image,
//       Table.configure({ resizable: true }),
//       TableRow,
//       TableCell,
//       TableHeader,
//     ],
//     content: value || "",
//     editorProps: {
//       attributes: {
//         class:
//           "min-h-[250px] p-4 prose prose-sm max-w-none focus:outline-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_table]:border-collapse [&_td]:border [&_th]:border [&_td]:p-2 [&_th]:p-2",
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

//   const handleImageUpload = (file) => {
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = () => {
//       editor.chain().focus().setImage({ src: reader.result }).run();
//     };
//     reader.readAsDataURL(file);
//   };

//   return (
//     <div className="border rounded-xl bg-white shadow-sm overflow-hidden">

//       {/* TOOLBAR */}
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

//         <ToolbarBtn
//           active={editor.isActive("bulletList")}
//           onClick={() => editor.chain().focus().toggleBulletList().run()}
//         >
//           • List
//         </ToolbarBtn>

//         <ToolbarBtn
//           active={editor.isActive("orderedList")}
//           onClick={() => editor.chain().focus().toggleOrderedList().run()}
//         >
//           1. List
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

//         {/* Table */}
//         <ToolbarBtn
//           onClick={() =>
//             editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()
//           }
//         >
//           Table
//         </ToolbarBtn>

//         <ToolbarBtn onClick={() => editor.chain().focus().undo().run()}>
//           Undo
//         </ToolbarBtn>

//         <ToolbarBtn onClick={() => editor.chain().focus().redo().run()}>
//           Redo
//         </ToolbarBtn>

//       </div>

//       {/* EDITOR */}
//       <EditorContent editor={editor} />
//     </div>
//   );
// }

// /* BUTTON */
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


import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { useEffect } from "react";

export default function RichTextEditorNew({ value, onChange }) {

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "min-h-[250px] p-4 prose prose-sm max-w-none focus:outline-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6",
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
    <div className="border rounded-xl bg-white shadow-sm overflow-hidden">

      {/* TOOLBAR */}
      <div className="flex flex-wrap gap-2 border-b bg-gray-50 p-2">

        <ToolbarBtn
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </ToolbarBtn>

        <ToolbarBtn
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </ToolbarBtn>

        <ToolbarBtn
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </ToolbarBtn>

        <ToolbarBtn
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </ToolbarBtn>

        {/* Text Color */}
        <input
          type="color"
          className="w-8 h-8 cursor-pointer"
          onChange={(e) =>
            editor.chain().focus().setColor(e.target.value).run()
          }
        />

        {/* Highlight */}
        <input
          type="color"
          className="w-8 h-8 cursor-pointer"
          onChange={(e) =>
            editor.chain().focus().toggleHighlight({ color: e.target.value }).run()
          }
        />

        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()}>
          Undo
        </ToolbarBtn>

        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()}>
          Redo
        </ToolbarBtn>

      </div>

      {/* EDITOR */}
      <EditorContent editor={editor} />
    </div>
  );
}

/* BUTTON */
function ToolbarBtn({ children, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 text-xs rounded transition ${
        active ? "bg-indigo-600 text-white" : "border hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}