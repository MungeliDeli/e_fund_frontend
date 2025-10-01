import React, { useMemo, useState, useEffect } from "react";

// Lazy load ReactQuill to avoid SSR issues
let ReactQuill = null;

const QuillEditor = ({
  value = "",
  onChange,
  placeholder = "Enter your message...",
  className = "",
  error = null,
  rows = 4,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Dynamically import ReactQuill and CSS
    const loadQuill = async () => {
      try {
        const module = await import("react-quill");
        ReactQuill = module.default;
        await import("react-quill/dist/quill.snow.css");
        setIsLoaded(true);
      } catch (error) {
        console.error("Failed to load ReactQuill:", error);
      }
    };

    loadQuill();
  }, []);

  // Configure Quill toolbar with only essential formatting options
  const modules = useMemo(
    () => ({
      toolbar: [["bold", "italic"], [{ list: "bullet" }], ["clean"]],
    }),
    []
  );

  // Configure Quill formats - only allow safe HTML tags
  const formats = useMemo(() => ["bold", "italic", "list", "bullet"], []);

  // Show loading state while Quill loads
  if (!isLoaded || !ReactQuill) {
    return (
      <div className={`quill-editor ${className}`}>
        <div className="h-24 bg-[color:var(--color-background)] border border-[color:var(--color-muted)] rounded-md animate-pulse flex items-center justify-center">
          <span className="text-[color:var(--color-secondary-text)]">
            Loading editor...
          </span>
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className={`quill-editor ${className}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        style={{
          height: `${rows * 1.5}rem`,
          backgroundColor: "var(--color-background)",
        }}
      />

      {/* Error message */}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {/* Help text */}
      <div className="text-xs text-[color:var(--color-secondary-text)] mt-1">
        Use the toolbar to format your text with <strong>bold</strong>,{" "}
        <em>italic</em>, and bullet lists
      </div>
    </div>
  );
};

export default QuillEditor;
