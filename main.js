/* PDF Bullet Helper – Obsidian Plugin v1.0.0 */
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => PdfBulletHelperPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian3 = require("obsidian");

// src/SettingsTab.ts
var import_obsidian = require("obsidian");

// src/types.ts
var DEFAULT_SETTINGS = {
  geminiApiKey: "",
  model: "gemini-2.5-flash",
  outputMode: "clipboard",
  bulletLevel: "normal",
  examCompression: true,
  wikiLinks: false,
  language: "de"
};
var GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-pro",
  "gemini-3.0-flash",
  "gemini-3.0-flash-preview",
  "gemini-3.1-flash-lite",
  "gemini-3.1-flash-live-preview",
  "gemini-3.5-flash"
];
var LEVEL_ROTATION = ["normal", "detailed", "short"];

// src/SettingsTab.ts
var PdfBulletHelperSettingsTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "PDF Bullet Helper" });
    containerEl.createEl("p", {
      text: "Select text in a PDF, press Alt+Q, and instantly get exam-ready Markdown bullet points.",
      cls: "setting-item-description"
    });
    containerEl.createEl("h3", { text: "API" });
    new import_obsidian.Setting(containerEl).setName("Gemini API Key").setDesc(
      "Your Google Gemini API key. Get one for free at aistudio.google.com."
    ).addText((text) => {
      text.setPlaceholder("AIzaSy\u2026").setValue(this.plugin.settings.geminiApiKey).onChange(async (value) => {
        this.plugin.settings.geminiApiKey = value.trim();
        await this.plugin.saveSettings();
      });
      text.inputEl.type = "password";
      text.inputEl.style.width = "100%";
    });
    new import_obsidian.Setting(containerEl).setName("Gemini Model").setDesc(
      "Which model to use. gemini-2.5-flash is recommended \u2014 fast and free."
    ).addDropdown((dd) => {
      GEMINI_MODELS.forEach((m) => dd.addOption(m, m));
      dd.setValue(this.plugin.settings.model);
      dd.onChange(async (value) => {
        this.plugin.settings.model = value;
        await this.plugin.saveSettings();
      });
    });
    containerEl.createEl("h3", { text: "Output" });
    new import_obsidian.Setting(containerEl).setName("Output Language").setDesc(
      "Language of the generated bullet points. The source text can be in any language."
    ).addDropdown(
      (dd) => {
        var _a;
        return dd.addOption("de", "\u{1F1E9}\u{1F1EA}  Deutsch").addOption("en", "\u{1F1EC}\u{1F1E7}  English").setValue((_a = this.plugin.settings.language) != null ? _a : "de").onChange(async (value) => {
          this.plugin.settings.language = value;
          await this.plugin.saveSettings();
        });
      }
    );
    new import_obsidian.Setting(containerEl).setName("Output Mode").setDesc("Where should the finished bullets be written?").addDropdown(
      (dd) => dd.addOption("clipboard", "\u{1F4CB}  Clipboard only  (Ctrl+V to paste)").addOption("smart", "\u{1F9E0}  Smart  (editor if active, else clipboard)").addOption("insert", "\u270F\uFE0F   Insert  (directly into active editor)").addOption("both", "\u{1F500}  Both  (clipboard + editor)").setValue(this.plugin.settings.outputMode).onChange(async (value) => {
        this.plugin.settings.outputMode = value;
        await this.plugin.saveSettings();
      })
    );
    containerEl.createEl("h3", { text: "Bullets" });
    new import_obsidian.Setting(containerEl).setName("Detail Level").setDesc("How many bullet points should be generated?").addDropdown(
      (dd) => dd.addOption("short", "\u26A1  Short  \u2014 2\u20133 key concepts").addOption("normal", "\u{1F4DD}  Normal  \u2014 4\u20138 bullets").addOption("detailed", "\u{1F4DA}  Detailed  \u2014 up to 15 bullets").setValue(this.plugin.settings.bulletLevel).onChange(async (value) => {
        this.plugin.settings.bulletLevel = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Exam Compression").setDesc(
      "Only include exam-relevant key points. Maximum condensation \u2014 every bullet must matter for a test."
    ).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.examCompression).onChange(async (value) => {
        this.plugin.settings.examCompression = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("WikiLinks").setDesc(
      "Link existing Obsidian notes as [[WikiLinks]]. Only notes that already exist in your vault will be linked."
    ).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.wikiLinks).onChange(async (value) => {
        this.plugin.settings.wikiLinks = value;
        await this.plugin.saveSettings();
      })
    );
    containerEl.createEl("h3", { text: "Hotkeys" });
    const hotkeyData = [
      ["Alt + Q", "Generate bullets  (from selection or buffer)"],
      ["Alt + A", "Add selection to collect buffer"],
      ["Alt + R", "Regenerate last input  (cycles: Normal \u2192 Detailed \u2192 Short)"]
    ];
    const table = containerEl.createEl("table");
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";
    table.style.marginTop = "8px";
    hotkeyData.forEach(([key, desc]) => {
      const row = table.createEl("tr");
      const tdKey = row.createEl("td");
      const tdDesc = row.createEl("td", { text: desc });
      tdKey.style.padding = "5px 18px 5px 0";
      tdDesc.style.padding = "5px 0";
      tdKey.style.whiteSpace = "nowrap";
      tdKey.createEl("code", { text: key });
    });
    const tip = containerEl.createEl("div");
    tip.style.marginTop = "28px";
    tip.style.padding = "12px 16px";
    tip.style.borderRadius = "6px";
    tip.style.fontSize = "0.88em";
    tip.style.opacity = "0.72";
    tip.innerHTML = "\u{1F4A1} <strong>Quick start:</strong> Open a PDF in Obsidian, drag to select a paragraph, press <code>Alt+Q</code>. Switch to your note, press <code>Ctrl+V</code>.";
  }
};

// src/GeminiClient.ts
var API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
var GeminiClient = class {
  constructor(apiKey, model) {
    this.apiKey = apiKey;
    this.model = model;
  }
  updateCredentials(apiKey, model) {
    this.apiKey = apiKey;
    this.model = model;
  }
  async generate(prompt) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    if (!this.apiKey) {
      throw new Error(
        "Kein API-Schl\xFCssel gesetzt. Bitte in den Plugin-Einstellungen eintragen."
      );
    }
    const url = `${API_BASE}/${this.model}:generateContent?key=${this.apiKey}`;
    let response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.25,
            maxOutputTokens: 2048,
            topP: 0.8,
            topK: 40
          },
          // Allow all safety categories so academic content isn't blocked
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
          ]
        })
      });
    } catch (networkErr) {
      throw new Error(
        `Netzwerkfehler beim Verbinden mit Gemini: ${String(networkErr)}`
      );
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const msg = (_b = (_a = data == null ? void 0 : data.error) == null ? void 0 : _a.message) != null ? _b : `HTTP ${response.status}`;
      throw new Error(`Gemini API Fehler: ${msg}`);
    }
    const text = (_g = (_f = (_e = (_d = (_c = data == null ? void 0 : data.candidates) == null ? void 0 : _c[0]) == null ? void 0 : _d.content) == null ? void 0 : _e.parts) == null ? void 0 : _f[0]) == null ? void 0 : _g.text;
    if (!text) {
      const reason = (_j = (_i = (_h = data == null ? void 0 : data.candidates) == null ? void 0 : _h[0]) == null ? void 0 : _i.finishReason) != null ? _j : "unbekannt";
      throw new Error(
        `Gemini hat keinen Text zur\xFCckgegeben (finishReason: ${reason}).`
      );
    }
    return text.trim();
  }
};

// src/PromptBuilder.ts
var LEVEL_DE = {
  short: "Erstelle maximal 3 Stichpunkte. Nur die absolut wichtigsten Kernbegriffe.",
  normal: "Erstelle 4\u20138 Stichpunkte. Alle wesentlichen Konzepte abdecken.",
  detailed: "Erstelle 8\u201315 Stichpunkte. Alle relevanten Aspekte, Definitionen und Zusammenh\xE4nge."
};
var LEVEL_EN = {
  short: "Create at most 3 bullets. Only the most critical key concepts.",
  normal: "Create 4\u20138 bullets. Cover all essential concepts.",
  detailed: "Create 8\u201315 bullets. Include all relevant aspects, definitions and relationships."
};
var BREVITY_DE = "K\xDCRZE: Verwende kurze Schl\xFCsselbegriffe und Halbs\xE4tze (max. 8 W\xF6rter pro Stichpunkt). KEINE vollst\xE4ndigen S\xE4tze. KEINE Verben wenn vermeidbar. Stichwort-Stil wie auf Karteikarten.";
var BREVITY_EN = "BREVITY: Use short key phrases and fragments (max. 8 words per bullet). NO complete sentences. NO verbs unless essential. Flashcard-style keywords only.";
var EXAM_DE = "\nEXAM: Nur klausurrelevante Kernaussagen. Maximale Verdichtung. Jeder Stichpunkt muss direkt pr\xFCfungsrelevant sein.";
var EXAM_EN = "\nEXAM: Exam-relevant key points only. Maximum compression. Every bullet must be directly relevant for a test.";
var SYSTEM_DE = 'Du bist ein pr\xE4ziser Lernassistent. Wandle den folgenden Text in Markdown-Stichpunkte auf DEUTSCH um.\n\nSTRIKTE FORMAT-REGELN \u2013 KEINE AUSNAHMEN:\n\u2022 Jede Zeile beginnt mit "- " (Bindestrich + Leerzeichen)\n\u2022 Keine \xDCberschriften, keine Nummerierungen\n\u2022 Keine Einleitung, kein Schlusssatz\n\u2022 Keine leeren Zeilen zwischen Stichpunkten\n\u2022 NUR Stichpunkte \u2013 absolut nichts anderes\n';
var SYSTEM_EN = 'You are a precise study assistant. Convert the following text into Markdown bullet points in ENGLISH.\n\nSTRICT FORMAT RULES \u2013 NO EXCEPTIONS:\n\u2022 Every line starts with "- " (dash + space)\n\u2022 No headings, no numbered lists\n\u2022 No introduction, no closing sentence\n\u2022 No empty lines between bullets\n\u2022 ONLY bullet points \u2013 absolutely nothing else\n';
var PromptBuilder = class {
  /**
   * @param text          The source text to summarise
   * @param settings      Current plugin settings
   * @param knownNotes    Vault note basenames for WikiLinks
   * @param overrideLevel Override the bullet level (for Alt+R rotation)
   */
  static build(text, settings, knownNotes = [], overrideLevel) {
    var _a;
    const level = overrideLevel != null ? overrideLevel : settings.bulletLevel;
    const lang = (_a = settings.language) != null ? _a : "de";
    const de = lang === "de";
    const system = de ? SYSTEM_DE : SYSTEM_EN;
    const brevity = de ? BREVITY_DE : BREVITY_EN;
    const levelStr = de ? LEVEL_DE[level] : LEVEL_EN[level];
    const examStr = settings.examCompression ? de ? EXAM_DE : EXAM_EN : "";
    let wikiStr = "";
    if (settings.wikiLinks && knownNotes.length > 0) {
      const noteList = knownNotes.slice(0, 100).join(", ");
      wikiStr = de ? `
WIKILINKS: Falls ein Begriff exakt einem Notiz-Titel entspricht, schreibe ihn als [[Begriff]]. Liste: ${noteList}. Nur Begriffe aus dieser Liste verlinken.` : `
WIKILINKS: If a term exactly matches a note title, write it as [[term]]. List: ${noteList}. Only link terms from this list.`;
    }
    const taskLabel = de ? "AUFGABE" : "TASK";
    const textLabel = de ? "TEXT" : "TEXT";
    const startLine = de ? 'Stichpunkte (beginne sofort mit "-", kein Vorwort):' : 'Bullets (start immediately with "-", no preamble):';
    return `${system}
${brevity}

${taskLabel}: ${levelStr}${examStr}${wikiStr}

${textLabel}:
"""
${text}
"""

${startLine}`;
  }
};

// src/OutputManager.ts
var import_obsidian2 = require("obsidian");
var OutputManager = class {
  constructor(app) {
    this.app = app;
  }
  async output(text, mode) {
    const editor = this.getActiveEditor();
    switch (mode) {
      case "smart":
        if (editor) {
          this.insertAtCursor(editor, text);
          new import_obsidian2.Notice("\u2705 Bullets inserted!");
        } else {
          await this.toClipboard(text);
          new import_obsidian2.Notice("\u{1F4CB} Bullets copied \u2014 press Ctrl+V to paste.");
        }
        break;
      case "clipboard":
        await this.toClipboard(text);
        new import_obsidian2.Notice("\u{1F4CB} Bullets copied \u2014 press Ctrl+V to paste.");
        break;
      case "insert":
        if (editor) {
          this.insertAtCursor(editor, text);
          new import_obsidian2.Notice("\u2705 Bullets inserted!");
        } else {
          await this.toClipboard(text);
          new import_obsidian2.Notice("\u26A0\uFE0F No active editor \u2014 copied to clipboard instead.");
        }
        break;
      case "both":
        await this.toClipboard(text);
        if (editor) {
          this.insertAtCursor(editor, text);
          new import_obsidian2.Notice("\u2705 Bullets inserted + copied to clipboard!");
        } else {
          new import_obsidian2.Notice("\u{1F4CB} Bullets copied \u2014 press Ctrl+V to paste.");
        }
        break;
    }
  }
  getActiveEditor() {
    var _a;
    const view = this.app.workspace.getActiveViewOfType(import_obsidian2.MarkdownView);
    return (_a = view == null ? void 0 : view.editor) != null ? _a : null;
  }
  insertAtCursor(editor, text) {
    const cursor = editor.getCursor();
    const lineContent = editor.getLine(cursor.line);
    const prefix = cursor.ch > 0 && lineContent.trim().length > 0 ? "\n" : "";
    editor.replaceRange(`${prefix}${text}
`, cursor);
  }
  async toClipboard(text) {
    await navigator.clipboard.writeText(text);
  }
};

// src/SelectionManager.ts
var SelectionManager = class {
  constructor() {
    this.buffer = [];
    this.lastSelection = null;
  }
  // ── Public API ─────────────────────────────────────────────────────────────
  /**
   * Reads the currently selected text.
   * Strategy:
   *   1. window.getSelection()  — covers Obsidian's PDF text layer (PDF.js)
   *   2. document.activeElement — fallback for <input> / <textarea>
   *
   * Returns null if nothing is selected.
   */
  getCurrentSelection() {
    var _a, _b, _c;
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) {
      const text = sel.toString().trim();
      if (text.length > 0) {
        this.lastSelection = text;
        return text;
      }
    }
    const active = document.activeElement;
    if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA") && typeof active.selectionStart === "number") {
      const val = (_a = active.value) != null ? _a : "";
      const start = (_b = active.selectionStart) != null ? _b : 0;
      const end = (_c = active.selectionEnd) != null ? _c : 0;
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
  getLastSelection() {
    return this.lastSelection;
  }
  /** Manually store a text as the last selection (used internally). */
  setLastSelection(text) {
    this.lastSelection = text;
  }
  // ── Collect buffer (Alt+A) ─────────────────────────────────────────────────
  /** Add a text snippet to the buffer. */
  addToBuffer(text) {
    this.buffer.push(text);
  }
  /** Returns the number of items in the buffer. */
  getBufferCount() {
    return this.buffer.length;
  }
  /** Returns true if the buffer has at least one item. */
  hasBuffer() {
    return this.buffer.length > 0;
  }
  /**
   * Returns a copy of the buffer and CLEARS it.
   * Call this when Alt+Q fires in collect mode.
   */
  flushBuffer() {
    const items = [...this.buffer];
    this.buffer = [];
    return items;
  }
};

// src/main.ts
var PdfBulletHelperPlugin = class extends import_obsidian3.Plugin {
  constructor() {
    super(...arguments);
    this.lastInput = null;
    this.regenStep = 0;
    this.isProcessing = false;
  }
  // ── Lifecycle ──────────────────────────────────────────────────────────────
  async onload() {
    await this.loadSettings();
    this.geminiClient = new GeminiClient(this.settings.geminiApiKey, this.settings.model);
    this.outputManager = new OutputManager(this.app);
    this.selectionManager = new SelectionManager();
    this.addSettingTab(new PdfBulletHelperSettingsTab(this.app, this));
    this.addCommand({
      id: "pdf-bullet-generate",
      name: "Generate bullets",
      hotkeys: [{ modifiers: ["Alt"], key: "q" }],
      callback: async () => this.handleGenerate()
    });
    this.addCommand({
      id: "pdf-bullet-collect",
      name: "Add selection to buffer",
      hotkeys: [{ modifiers: ["Alt"], key: "a" }],
      callback: () => this.handleCollect()
    });
    this.addCommand({
      id: "pdf-bullet-regenerate",
      name: "Regenerate last input (cycles detail level)",
      hotkeys: [{ modifiers: ["Alt"], key: "r" }],
      callback: async () => this.handleRegenerate()
    });
    console.log("[PDF Bullet Helper] Loaded.");
  }
  onunload() {
    console.log("[PDF Bullet Helper] Unloaded.");
  }
  // ── Command handlers ───────────────────────────────────────────────────────
  async handleGenerate() {
    if (this.isProcessing) {
      new import_obsidian3.Notice("\u23F3 Already processing, please wait\u2026");
      return;
    }
    let inputText;
    if (this.selectionManager.hasBuffer()) {
      const items = this.selectionManager.flushBuffer();
      const current = this.selectionManager.getCurrentSelection();
      if (current)
        items.push(current);
      inputText = items.join("\n\n---\n\n");
      new import_obsidian3.Notice(`\u{1F4DA} Processing ${items.length} collected sections\u2026`);
    } else {
      const sel = this.selectionManager.getCurrentSelection();
      if (!sel) {
        new import_obsidian3.Notice(
          "\u26A0\uFE0F No text selected.\nSelect text in the PDF viewer first, then press Alt+Q."
        );
        return;
      }
      inputText = sel;
    }
    this.lastInput = inputText;
    this.regenStep = 0;
    await this.process(inputText, this.settings.bulletLevel);
  }
  handleCollect() {
    const sel = this.selectionManager.getCurrentSelection();
    if (!sel) {
      new import_obsidian3.Notice("\u26A0\uFE0F No text selected.");
      return;
    }
    this.selectionManager.addToBuffer(sel);
    const count = this.selectionManager.getBufferCount();
    new import_obsidian3.Notice(`\u{1F4CC} Section ${count} added to buffer.
Press Alt+Q to process all.`);
  }
  async handleRegenerate() {
    if (!this.lastInput) {
      new import_obsidian3.Notice("\u26A0\uFE0F Nothing to regenerate. Press Alt+Q first.");
      return;
    }
    if (this.isProcessing) {
      new import_obsidian3.Notice("\u23F3 Already processing, please wait\u2026");
      return;
    }
    this.regenStep = (this.regenStep + 1) % LEVEL_ROTATION.length;
    const level = LEVEL_ROTATION[this.regenStep];
    new import_obsidian3.Notice(`\u{1F504} Regenerating \u2014 level: ${level.toUpperCase()}`);
    await this.process(this.lastInput, level);
  }
  // ── Core processing ────────────────────────────────────────────────────────
  async process(text, level) {
    if (!this.settings.geminiApiKey) {
      new import_obsidian3.Notice(
        "\u274C No API key set.\nPlease add your Gemini key under Settings \u2192 PDF Bullet Helper."
      );
      return;
    }
    this.isProcessing = true;
    const loadingNotice = new import_obsidian3.Notice("\u23F3 Generating bullets\u2026", 0);
    try {
      const knownNotes = this.settings.wikiLinks ? this.app.vault.getMarkdownFiles().map((f) => f.basename) : [];
      const prompt = PromptBuilder.build(text, this.settings, knownNotes, level);
      this.geminiClient.updateCredentials(
        this.settings.geminiApiKey,
        this.settings.model
      );
      const raw = await this.geminiClient.generate(prompt);
      const bullets = this.processBullets(raw);
      if (bullets.length === 0) {
        new import_obsidian3.Notice("\u26A0\uFE0F Gemini returned no bullets. Please try again.");
        return;
      }
      await this.outputManager.output(bullets.join("\n"), this.settings.outputMode);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      new import_obsidian3.Notice(`\u274C Error: ${msg}`, 1e4);
      console.error("[PDF Bullet Helper]", err);
    } finally {
      loadingNotice.hide();
      this.isProcessing = false;
    }
  }
  // ── Bullet post-processing ─────────────────────────────────────────────────
  processBullets(raw) {
    const lines = raw.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    const bullets = [];
    const seen = /* @__PURE__ */ new Set();
    for (const line of lines) {
      if (/^#{1,6}\s/.test(line))
        continue;
      if (line.startsWith("```"))
        continue;
      if (/^[-_*]{3,}$/.test(line))
        continue;
      let bullet;
      if (line.startsWith("- ")) {
        bullet = line;
      } else if (line.startsWith("* ") || line.startsWith("\u2022 ")) {
        bullet = "- " + line.slice(2);
      } else if (/^\d+[.)]\s+/.test(line)) {
        bullet = "- " + line.replace(/^\d+[.)]\s+/, "");
      } else {
        bullet = "- " + line;
      }
      const content = bullet.replace(/^-\s+/, "").toLowerCase().trim();
      if (content.length < 3)
        continue;
      if (seen.has(content))
        continue;
      seen.add(content);
      bullets.push(bullet);
    }
    return bullets;
  }
  // ── Settings ───────────────────────────────────────────────────────────────
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
    if (this.geminiClient) {
      this.geminiClient.updateCredentials(
        this.settings.geminiApiKey,
        this.settings.model
      );
    }
  }
};
