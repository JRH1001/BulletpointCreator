// ─── SettingsTab ──────────────────────────────────────────────────────────────
// Renders the plugin settings page — UI is in English.

import { App, PluginSettingTab, Setting } from "obsidian";
import type PdfBulletHelperPlugin from "./main";
import { GEMINI_MODELS } from "./types";

export class PdfBulletHelperSettingsTab extends PluginSettingTab {
  plugin: PdfBulletHelperPlugin;

  constructor(app: App, plugin: PdfBulletHelperPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // ── Header ──────────────────────────────────────────────────────────────
    containerEl.createEl("h2", { text: "PDF Bullet Helper" });
    containerEl.createEl("p", {
      text:
        "Select text in a PDF, press Alt+Q, and instantly get " +
        "exam-ready Markdown bullet points.",
      cls: "setting-item-description",
    });

    // ── Section: API ─────────────────────────────────────────────────────────
    containerEl.createEl("h3", { text: "API" });

    new Setting(containerEl)
      .setName("Gemini API Key")
      .setDesc(
        "Your Google Gemini API key. Get one for free at aistudio.google.com."
      )
      .addText((text) => {
        text
          .setPlaceholder("AIzaSy…")
          .setValue(this.plugin.settings.geminiApiKey)
          .onChange(async (value) => {
            this.plugin.settings.geminiApiKey = value.trim();
            await this.plugin.saveSettings();
          });
        text.inputEl.type = "password";
        text.inputEl.style.width = "100%";
      });

    new Setting(containerEl)
      .setName("Gemini Model")
      .setDesc(
        "Which model to use. gemini-2.5-flash is recommended — fast and free."
      )
      .addDropdown((dd) => {
        GEMINI_MODELS.forEach((m) => dd.addOption(m, m));
        dd.setValue(this.plugin.settings.model);
        dd.onChange(async (value) => {
          this.plugin.settings.model = value;
          await this.plugin.saveSettings();
        });
      });

    // ── Section: Output ───────────────────────────────────────────────────────
    containerEl.createEl("h3", { text: "Output" });

    new Setting(containerEl)
      .setName("Output Language")
      .setDesc(
        "Language of the generated bullet points. " +
        "The source text can be in any language."
      )
      .addDropdown((dd) =>
        dd
          .addOption("de", "🇩🇪  Deutsch")
          .addOption("en", "🇬🇧  English")
          .setValue(this.plugin.settings.language ?? "de")
          .onChange(async (value) => {
            this.plugin.settings.language = value as never;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Output Mode")
      .setDesc("Where should the finished bullets be written?")
      .addDropdown((dd) =>
        dd
          .addOption("clipboard", "📋  Clipboard only  (Ctrl+V to paste)")
          .addOption("smart",     "🧠  Smart  (editor if active, else clipboard)")
          .addOption("insert",    "✏️   Insert  (directly into active editor)")
          .addOption("both",      "🔀  Both  (clipboard + editor)")
          .setValue(this.plugin.settings.outputMode)
          .onChange(async (value) => {
            this.plugin.settings.outputMode = value as never;
            await this.plugin.saveSettings();
          })
      );

    // ── Section: Bullets ─────────────────────────────────────────────────────
    containerEl.createEl("h3", { text: "Bullets" });

    new Setting(containerEl)
      .setName("Detail Level")
      .setDesc("How many bullet points should be generated?")
      .addDropdown((dd) =>
        dd
          .addOption("short",    "⚡  Short  — 2–3 key concepts")
          .addOption("normal",   "📝  Normal  — 4–8 bullets")
          .addOption("detailed", "📚  Detailed  — up to 15 bullets")
          .setValue(this.plugin.settings.bulletLevel)
          .onChange(async (value) => {
            this.plugin.settings.bulletLevel = value as never;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Exam Compression")
      .setDesc(
        "Only include exam-relevant key points. " +
        "Maximum condensation — every bullet must matter for a test."
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.examCompression)
          .onChange(async (value) => {
            this.plugin.settings.examCompression = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("WikiLinks")
      .setDesc(
        "Link existing Obsidian notes as [[WikiLinks]]. " +
        "Only notes that already exist in your vault will be linked."
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.wikiLinks)
          .onChange(async (value) => {
            this.plugin.settings.wikiLinks = value;
            await this.plugin.saveSettings();
          })
      );

    // ── Section: Hotkeys ─────────────────────────────────────────────────────
    containerEl.createEl("h3", { text: "Hotkeys" });

    const hotkeyData: [string, string][] = [
      ["Alt + Q", "Generate bullets  (from selection or buffer)"],
      ["Alt + A", "Add selection to collect buffer"],
      ["Alt + R", "Regenerate last input  (cycles: Normal → Detailed → Short)"],
    ];

    const table = containerEl.createEl("table");
    table.style.borderCollapse = "collapse";
    table.style.width          = "100%";
    table.style.marginTop      = "8px";

    hotkeyData.forEach(([key, desc]) => {
      const row    = table.createEl("tr");
      const tdKey  = row.createEl("td");
      const tdDesc = row.createEl("td", { text: desc });
      tdKey.style.padding  = "5px 18px 5px 0";
      tdDesc.style.padding = "5px 0";
      tdKey.style.whiteSpace = "nowrap";
      tdKey.createEl("code", { text: key });
    });

    // ── Tip box ───────────────────────────────────────────────────────────────
    const tip = containerEl.createEl("div");
    tip.style.marginTop    = "28px";
    tip.style.padding      = "12px 16px";
    tip.style.borderRadius = "6px";
    tip.style.fontSize     = "0.88em";
    tip.style.opacity      = "0.72";
    tip.innerHTML =
      "💡 <strong>Quick start:</strong> Open a PDF in Obsidian, drag to select a " +
      "paragraph, press <code>Alt+Q</code>. Switch to your note, press <code>Ctrl+V</code>.";
  }
}
