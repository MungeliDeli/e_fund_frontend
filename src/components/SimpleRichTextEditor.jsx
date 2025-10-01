import React, { useRef, useState, useEffect } from "react";
import { FiBold, FiItalic, FiList } from "react-icons/fi";

const SimpleRichTextEditor = ({
  value = "",
  onChange,
  placeholder = "Enter your message...",
  className = "",
  error = null,
  rows = 4,
}) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  // Update editor content when value prop changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertList = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const listItem = document.createElement("li");
      listItem.innerHTML = "&nbsp;";

      const ul = document.createElement("ul");
      ul.appendChild(listItem);

      range.deleteContents();
      range.insertNode(ul);

      // Position cursor inside the list item
      const newRange = document.createRange();
      newRange.setStart(listItem, 0);
      newRange.setEnd(listItem, 0);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
    handleInput();
  };

  const formatButtons = [
    {
      command: "bold",
      icon: FiBold,
      title: "Bold",
      shortcut: "Ctrl+B",
    },
    {
      command: "italic",
      icon: FiItalic,
      title: "Italic",
      shortcut: "Ctrl+I",
    },
    {
      command: "insertUnorderedList",
      icon: FiList,
      title: "Bullet List",
      action: insertList,
    },
  ];

  return (
    <div className={`simple-rich-text-editor ${className}`}>
      {/* Toolbar */}
      <div
        className={`flex items-center gap-1 p-2 border border-[color:var(--color-muted)] rounded-t-md bg-[color:var(--color-surface)] transition-colors ${
          isFocused ? "border-[color:var(--color-primary)]" : ""
        }`}
      >
        {formatButtons.map((button) => (
          <button
            key={button.command}
            type="button"
            onClick={() =>
              button.action ? button.action() : execCommand(button.command)
            }
            className="p-2 rounded hover:bg-[color:var(--color-muted)] transition-colors"
            title={`${button.title} (${button.shortcut})`}
          >
            <button.icon className="w-4 h-4 text-[color:var(--color-primary-text)]" />
          </button>
        ))}

        <div className="flex-1" />

        <div className="text-xs text-[color:var(--color-secondary-text)]">
          {value.replace(/<[^>]*>/g, "").length} characters
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`w-full px-3 py-2 border border-t-0 border-[color:var(--color-muted)] rounded-b-md bg-[color:var(--color-background)] text-[color:var(--color-primary-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] focus:border-[color:var(--color-primary)] ${
          error ? "border-red-500" : ""
        }`}
        style={{ minHeight: `${rows * 1.5}rem` }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      

      {/* Error message */}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {/* Help text */}
      <div className="text-xs text-[color:var(--color-secondary-text)] mt-1">
        Use{" "}
        <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+B</kbd>{" "}
        for bold,
        <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs ml-1">
          Ctrl+I
        </kbd>{" "}
        for italic
      </div>

      <style jsx>{`
        .simple-rich-text-editor {
          position: relative;
        }

        .simple-rich-text-editor [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: var(--color-secondary-text);
          pointer-events: none;
          position: absolute;
        }

        .simple-rich-text-editor ul {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
          list-style-type: disc;
        }

        .simple-rich-text-editor li {
          margin: 0.25rem 0;
          line-height: 1.5;
        }

        .simple-rich-text-editor strong {
          font-weight: 600;
        }

        .simple-rich-text-editor em {
          font-style: italic;
        }

        .simple-rich-text-editor p {
          margin: 0.5rem 0;
          line-height: 1.5;
        }

        .simple-rich-text-editor p:first-child {
          margin-top: 0;
        }

        .simple-rich-text-editor p:last-child {
          margin-bottom: 0;
        }

        .simple-rich-text-editor kbd {
          font-family: "Courier New", monospace;
          background-color: var(--color-muted);
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          border: 1px solid var(--color-muted);
        }
      `}</style>
    </div>
  );
};

export default SimpleRichTextEditor;
