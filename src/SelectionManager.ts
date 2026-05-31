// ─── SelectionManager ─────────────────────────────────────────────────────────
// Reads selected text from Obsidian's PDF viewer (or any active element)
// and manages the Alt+A collect buffer.

export class SelectionManager {
  private buffer:        string[] = [];
  private lastSelection: string | null = null;

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Reads the currently selected text.
   * Strategy:
   *   1. window.getSelection()  — covers Obsidian's PDF text layer (PDF.js)
   *   2. document.activeElement — fallback for <input> / <textarea>
   *
   * Returns null if nothing is selected.
   */
  getCurrentSelection(): string | null {
    // 1 – Standard window selection (works for PDF viewer text layer)
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) {
      const text = sel.toString().trim();
      if (text.length > 0) {
        this.lastSelection = text;
        return text;
      }
    }

    // 2 – Active <input> or <textarea>
    const active = document.activeElement as HTMLInputElement | null;
    if (
      active &&
      (active.tagName === "INPUT" || active.tagName === "TEXTAREA") &&
      typeof active.selectionStart === "number"
    ) {
      const val   = active.value ?? "";
      const start = active.selectionStart ?? 0;
      const end   = active.selectionEnd   ?? 0;
      if (end > start) {
        const text = val.substring(start, end).trim();
        if (text.length > 0) {
          this.lastSelection = text;
          return text;
        }
      }
    }

    return null;
  }

  /** Returns the last successfully captured selection (used by Alt+R). */
  getLastSelection(): string | null {
    return this.lastSelection;
  }

  /** Manually store a text as the last selection (used internally). */
  setLastSelection(text: string): void {
    this.lastSelection = text;
  }

  // ── Collect buffer (Alt+A) ─────────────────────────────────────────────────

  /** Add a text snippet to the buffer. */
  addToBuffer(text: string): void {
    this.buffer.push(text);
  }

  /** Returns the number of items in the buffer. */
  getBufferCount(): number {
    return this.buffer.length;
  }

  /** Returns true if the buffer has at least one item. */
  hasBuffer(): boolean {
    return this.buffer.length > 0;
  }

  /**
   * Returns a copy of the buffer and CLEARS it.
   * Call this when Alt+Q fires in collect mode.
   */
  flushBuffer(): string[] {
    const items = [...this.buffer];
    this.buffer = [];
    return items;
  }
}
