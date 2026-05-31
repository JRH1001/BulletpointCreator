// ─── OutputManager ────────────────────────────────────────────────────────────

import { App, Editor, MarkdownView, Notice } from "obsidian";
import type { OutputMode } from "./types";

export class OutputManager {
  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  async output(text: string, mode: OutputMode): Promise<void> {
    const editor = this.getActiveEditor();

    switch (mode) {
      case "smart":
        if (editor) {
          this.insertAtCursor(editor, text);
          new Notice("✅ Bullets inserted!");
        } else {
          await this.toClipboard(text);
          new Notice("📋 Bullets copied — press Ctrl+V to paste.");
        }
        break;

      case "clipboard":
        await this.toClipboard(text);
        new Notice("📋 Bullets copied — press Ctrl+V to paste.");
        break;

      case "insert":
        if (editor) {
          this.insertAtCursor(editor, text);
          new Notice("✅ Bullets inserted!");
        } else {
          await this.toClipboard(text);
          new Notice("⚠️ No active editor — copied to clipboard instead.");
        }
        break;

      case "both":
        await this.toClipboard(text);
        if (editor) {
          this.insertAtCursor(editor, text);
          new Notice("✅ Bullets inserted + copied to clipboard!");
        } else {
          new Notice("📋 Bullets copied — press Ctrl+V to paste.");
        }
        break;
    }
  }

  private getActiveEditor(): Editor | null {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    return view?.editor ?? null;
  }

  private insertAtCursor(editor: Editor, text: string): void {
    const cursor      = editor.getCursor();
    const lineContent = editor.getLine(cursor.line);
    const prefix      = cursor.ch > 0 && lineContent.trim().length > 0 ? "\n" : "";
    editor.replaceRange(`${prefix}${text}\n`, cursor);
  }

  private async toClipboard(text: string): Promise<void> {
    await navigator.clipboard.writeText(text);
  }
}
