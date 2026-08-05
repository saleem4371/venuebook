"use client";

import { useRef, useEffect, useState } from "react";
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, ChevronDown } from "lucide-react";

/* Strips HTML tags to get a plain-text length for the character counter —
   good enough for a soft limit, doesn't need to be byte-perfect. */
function stripHtml(html) {
  return (html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

const TOOLS = [
  { cmd: "bold", icon: Bold, label: "Bold" },
  { cmd: "italic", icon: Italic, label: "Italic" },
  { cmd: "underline", icon: UnderlineIcon, label: "Underline" },
  { cmd: "insertUnorderedList", icon: List, label: "Bullet list" },
  { cmd: "insertOrderedList", icon: ListOrdered, label: "Numbered list" },
];

/* Lightweight contentEditable rich text editor — no external deps.
   Uncontrolled by design: innerHTML is only synced from `value` when the
   field isn't focused, so typing doesn't fight React re-renders / jump
   the cursor. */
export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  maxLength, // optional — omit for no cap
  tk,
  minHeight = 120,
}) {
  const ref = useRef(null);
  const isFocused = useRef(false);
  const [isEmpty, setIsEmpty] = useState(!stripHtml(value));
  const [charCount, setCharCount] = useState(stripHtml(value).length);
  // Collapsed to a single bar once rules are written, so a long Terms &
  // Conditions doesn't force guests-worth of scrolling through this box
  // every time the step re-renders.
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (ref.current && !isFocused.current && ref.current.innerHTML !== (value || "")) {
      ref.current.innerHTML = value || "";
      setIsEmpty(!stripHtml(value));
      setCharCount(stripHtml(value).length);
    }
  }, [value]);

  const handleInput = () => {
    const html = ref.current?.innerHTML || "";
    const text = ref.current?.textContent || "";
    setIsEmpty(!text.trim());
    setCharCount(text.length);
    onChange(html);
  };

  const exec = (cmd) => {
    ref.current?.focus();
    document.execCommand(cmd, false, null);
    handleInput();
  };

  const overLimit = maxLength != null && charCount > maxLength;

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${overLimit ? "#f87171" : tk.inputBd}` }}>
      {/* Toolbar — sits outside the scrollable editable area below, so it
          never scrolls out of view while editing a long document. When
          collapsed it swaps the format buttons for a neutral status line
          (never the raw written text — showing actual content there read
          like a broken/garbled preview). */}
      <div
        className={collapsed ? "flex items-center gap-0.5 p-3" : "flex items-center gap-0.5 px-2 py-1.5"}
        style={{ background: tk.cardAlt, borderBottom: collapsed ? "none" : `1px solid ${tk.border}` }}
      >
        {collapsed ? (
          <span className="text-[12px] font-medium" style={{ color: tk.muted }}>
            {isEmpty ? "No rules added yet" : "Venue rules added"}
          </span>
        ) : (
          TOOLS.map((t) => (
            <button
              key={t.cmd}
              type="button"
              title={t.label}
              aria-label={t.label}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec(t.cmd)}
              className="w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:opacity-70 cursor-pointer"
              style={{ color: tk.muted }}
            >
              <t.icon size={14} />
            </button>
          ))
        )}

        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expand" : "Collapse"}
          aria-label={collapsed ? "Expand" : "Collapse"}
          className="ml-auto w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:opacity-70 cursor-pointer shrink-0"
          style={{ color: tk.muted }}
        >
          <ChevronDown
            size={14}
            style={{ transform: collapsed ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 150ms" }}
          />
        </button>
      </div>

      {/* Editable area — always mounted (never unmounted on collapse) so
          the contentEditable DOM node and its innerHTML survive a
          collapse/expand cycle; it used to live inside a `{!collapsed &&
          ...}` block, which tore the node down and lost whatever had been
          typed. Collapsing now just hides it with CSS and caps its height
          with its own internal scroll, so the toolbar above never scrolls
          away even on a long Terms & Conditions. */}
      <div
        className="relative"
        style={{
          background: tk.inputBg,
          display: collapsed ? "none" : "block",
          maxHeight: 340,
          overflowY: "auto",
        }}
      >
        {isEmpty && (
          <span
            className="absolute left-4 top-3 text-[13px] pointer-events-none"
            style={{ color: tk.dimmed }}
          >
            {placeholder}
          </span>
        )}
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onFocus={() => { isFocused.current = true; }}
          onBlur={() => { isFocused.current = false; }}
          onInput={handleInput}
          className="rte-content px-4 py-3 text-[13px] leading-relaxed outline-none"
          style={{ color: tk.text, minHeight }}
        />
        <style>{`
          .rte-content ul { list-style: disc; padding-left: 1.25rem; }
          .rte-content ol { list-style: decimal; padding-left: 1.25rem; }
          .rte-content li { margin: 2px 0; }
        `}</style>
      </div>

      {/* Counter — only shown when a cap is actually enforced */}
      {!collapsed && maxLength != null && (
        <div className="flex justify-end px-3 py-1.5" style={{ background: tk.cardAlt, borderTop: `1px solid ${tk.border}` }}>
          <span className="text-[11px] tabular-nums" style={{ color: overLimit ? "#f87171" : tk.dimmed }}>
            {charCount} / {maxLength}
          </span>
        </div>
      )}
    </div>
  );
}
