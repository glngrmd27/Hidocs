import { useMemo } from "react";
import ReactQuill from "react-quill-new";
import katex from "katex";
import "katex/dist/katex.min.css";
import "react-quill-new/dist/quill.snow.css";
import "../assets/css/RichTextEditor.css";

// Quill formula module butuh katex tersedia di window
if (typeof window !== "undefined") {
  window.katex = katex;
}

function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write your question here...",
}) {

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote", "code-block"],
        ["link", "video"],
        ["formula"],
        ["clean"],
      ],
      history: {
        delay: 500,
        maxStack: 100,
        userOnly: true,
      },
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "blockquote",
    "code-block",
    "link",
    "video",
    "formula",
  ];

  const handleChange = (html, _delta, source) => {
    if (source !== "user") return;
    if (typeof onChange === "function") {
      const isEmpty = html === "<p><br></p>";
      onChange(isEmpty ? "" : html);
    }
  };

  return (
    <div className="rich-text-editor">
      <ReactQuill
        theme="snow"
        value={value || ""}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />

      <div className="rich-editor-footer">
        <span>Rich text question editor</span>
        <span>WYSIWYG</span>
      </div>
    </div>
  );
}

export default RichTextEditor;