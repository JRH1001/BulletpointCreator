// ─── PDF Bullet Helper – main.ts ──────────────────────────────────────────────
//
// Hotkeys:
//   Alt+Q  — generate bullets from current selection (or flushed buffer)
//   Alt+A  — add current selection to the collect buffer
//   Alt+R  — regenerate last input, cycling through detail levels

import { Notice, Plugin, TFile } from "obsidian";
import { PdfBulletHelperSettingsTab } from "./SettingsTab";
import { GeminiClient }               from "./GeminiClient";
import { PromptBuilder }              from "./PromptBuilder";
import { OutputManager }              from "./OutputManager";
import { SelectionManager }           from "./SelectionManager";
import {
  DEFAULT_SETTINGS,
  LEVEL_ROTATION,
  PluginSettings,
  BulletLevel,
} from "./types";

export default class PdfBulletHelperPlugin extends Plugin {
  settings: PluginSettings;

  private geminiClient:     GeminiClient;
  private outputManager:    OutputManager;
  private selectionManager: SelectionManager;

  private lastInput:    string | null = null;
  private regenStep:    number        = 0;
  private isProcessing: boolean       = false;

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  async onload(): Promise<void> {
    await this.loadSettings();

    this.geminiClient     = new GeminiClient(this.settings.geminiApiKey, this.settings.model);
    this.outputManager    = new OutputManager(this.app);
    this.selectionManager = new SelectionManager();

    this.addSettingTab(new PdfBulletHelperSettingsTab(this.app, this));

    // Alt+Q — Generate
    this.addCommand({
      id:       "pdf-bullet-generate",
      name:     "Generate bullets",
      hotkeys:  [{ modifiers: ["Alt"], key: "q" }],
      callback: async () => this.handleGenerate(),
    });

    // Alt+A — Collect
    this.addCommand({
      id:       "pdf-bullet-collect",
      name:     "Add selection to buffer",
      hotkeys:  [{ modifiers: ["Alt"], key: "a" }],
      callback: () => this.handleCollect(),
    });

    // Alt+R — Regenerate
    this.addCommand({
      id:       "pdf-bullet-regenerate",
      name:     "Regenerate last input (cycles detail level)",
      hotkeys:  [{ modifiers: ["Alt"], key: "r" }],
      callback: async () => this.handleRegenerate(),
    });

    console.log("[PDF Bullet Helper] Loaded.");
  }

  onunload(): void {
    console.log("[PDF Bullet Helper] Unloaded.");
  }

  // ── Command handlers ───────────────────────────────────────────────────────

  private async handleGenerate(): Promise<void> {
    if (this.isProcessing) {
      new Notice("⏳ Already processing, please wait…");
      return;
    }

    let inputText: string;

    if (this.selectionManager.hasBuffer()) {
      const items   = this.selectionManager.flushBuffer();
      const current = this.selectionManager.getCurrentSelection();
      if (current) items.push(current);
      inputText = items.join("\n\n---\n\n");
      new Notice(`📚 Processing ${items.length} collected sections…`);
    } else {
      const sel = this.selectionManager.getCurrentSelection();
      if (!sel) {
        new Notice(
          "⚠️ No text selected.\n" +
          "Select text in the PDF viewer first, then press Alt+Q."
        );
        return;
      }
      inputText = sel;
    }

    this.lastInput = inputText;
    this.regenStep = 0;

    await this.process(inputText, this.settings.bulletLevel);
  }

  private handleCollect(): void {
    const sel = this.selectionManager.getCurrentSelection();
    if (!sel) {
      new Notice("⚠️ No text selected.");
      return;
    }
    this.selectionManager.addToBuffer(sel);
    const count = this.selectionManager.getBufferCount();
    new Notice(`📌 Section ${count} added to buffer.\nPress Alt+Q to process all.`);
  }

  private async handleRegenerate(): Promise<void> {
    if (!this.lastInput) {
      new Notice("⚠️ Nothing to regenerate. Press Alt+Q first.");
      return;
    }
    if (this.isProcessing) {
      new Notice("⏳ Already processing, please wait…");
      return;
    }

    this.regenStep = (this.regenStep + 1) % LEVEL_ROTATION.length;
    const level: BulletLevel = LEVEL_ROTATION[this.regenStep];

    new Notice(`🔄 Regenerating — level: ${level.toUpperCase()}`);
    await this.process(this.lastInput, level);
  }

  // ── Core processing ────────────────────────────────────────────────────────

  private async process(text: string, level: BulletLevel): Promise<void> {
    if (!this.settings.geminiApiKey) {
      new Notice(
        "❌ No API key set.\n" +
        "Please add your Gemini key under Settings → PDF Bullet Helper."
      );
      return;
    }

    this.isProcessing = true;
    const loadingNotice = new Notice("⏳ Generating bullets…", 0);

    try {
      const knownNotes: string[] = this.settings.wikiLinks
        ? this.app.vault.getMarkdownFiles().map((f: TFile) => f.basename)
        : [];

      const prompt = PromptBuilder.build(text, this.settings, knownNotes, level);

      this.geminiClient.updateCredentials(
        this.settings.geminiApiKey,
        this.settings.model
      );

      const raw     = await this.geminiClient.generate(prompt);
      const bullets = this.processBullets(raw);

      if (bullets.length === 0) {
        new Notice("⚠️ Gemini returned no bullets. Please try again.");
        return;
      }

      await this.outputManager.output(bullets.join("\n"), this.settings.outputMode);

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      new Notice(`❌ Error: ${msg}`, 10_000);
      console.error("[PDF Bullet Helper]", err);
    } finally {
      loadingNotice.hide();
      this.isProcessing = false;
    }
  }

  // ── Bullet post-processing ─────────────────────────────────────────────────

  private processBullets(raw: string): string[] {
    const lines   = raw.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    const bullets: string[] = [];
    const seen    = new Set<string>();

    for (const line of lines) {
      // Strip headings, code fences, horizontal rules
      if (/^#{1,6}\s/.test(line))   continue;
      if (line.startsWith("```"))    continue;
      if (/^[-_*]{3,}$/.test(line)) continue;

      // Normalise list prefix to "- "
      let bullet: string;
      if (line.startsWith("- ")) {
        bullet = line;
      } else if (line.startsWith("* ") || line.startsWith("• ")) {
        bullet = "- " + line.slice(2);
      } else if (/^\d+[.)]\s+/.test(line)) {
        bullet = "- " + line.replace(/^\d+[.)]\s+/, "");
      } else {
        bullet = "- " + line;
      }

      // Deduplicate (F8)
      const content = bullet.replace(/^-\s+/, "").toLowerCase().trim();
      if (content.length < 3) continue;
      if (seen.has(content))  continue;

      seen.add(content);
      bullets.push(bullet);
    }

    return bullets;
  }

  // ── Settings ───────────────────────────────────────────────────────────────

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    if (this.geminiClient) {
      this.geminiClient.updateCredentials(
        this.settings.geminiApiKey,
        this.settings.model
      );
    }
  }
}
