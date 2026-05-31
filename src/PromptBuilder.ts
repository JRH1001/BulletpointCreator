// ─── PromptBuilder ────────────────────────────────────────────────────────────
// Builds the Gemini prompt based on current settings and input text.
// Supports DE / EN output language.

import type { BulletLevel, Language, PluginSettings } from "./types";

// ── Level instructions ────────────────────────────────────────────────────────

const LEVEL_DE: Record<BulletLevel, string> = {
  short:
    "Erstelle maximal 3 Stichpunkte. Nur die absolut wichtigsten Kernbegriffe.",
  normal:
    "Erstelle 4–8 Stichpunkte. Alle wesentlichen Konzepte abdecken.",
  detailed:
    "Erstelle 8–15 Stichpunkte. Alle relevanten Aspekte, Definitionen und Zusammenhänge.",
};

const LEVEL_EN: Record<BulletLevel, string> = {
  short:
    "Create at most 3 bullets. Only the most critical key concepts.",
  normal:
    "Create 4–8 bullets. Cover all essential concepts.",
  detailed:
    "Create 8–15 bullets. Include all relevant aspects, definitions and relationships.",
};

// ── Brevity instruction (the core change: no full sentences) ──────────────────

const BREVITY_DE =
  "KÜRZE: Verwende kurze Schlüsselbegriffe und Halbsätze (max. 8 Wörter pro Stichpunkt). " +
  "KEINE vollständigen Sätze. KEINE Verben wenn vermeidbar. Stichwort-Stil wie auf Karteikarten.";

const BREVITY_EN =
  "BREVITY: Use short key phrases and fragments (max. 8 words per bullet). " +
  "NO complete sentences. NO verbs unless essential. Flashcard-style keywords only.";

// ── Exam compression ──────────────────────────────────────────────────────────

const EXAM_DE =
  "\nEXAM: Nur klausurrelevante Kernaussagen. Maximale Verdichtung. " +
  "Jeder Stichpunkt muss direkt prüfungsrelevant sein.";

const EXAM_EN =
  "\nEXAM: Exam-relevant key points only. Maximum compression. " +
  "Every bullet must be directly relevant for a test.";

// ── System prompt by language ─────────────────────────────────────────────────

const SYSTEM_DE =
  "Du bist ein präziser Lernassistent. Wandle den folgenden Text in " +
  "Markdown-Stichpunkte auf DEUTSCH um.\n\n" +
  "STRIKTE FORMAT-REGELN – KEINE AUSNAHMEN:\n" +
  "• Jede Zeile beginnt mit \"- \" (Bindestrich + Leerzeichen)\n" +
  "• Keine Überschriften, keine Nummerierungen\n" +
  "• Keine Einleitung, kein Schlusssatz\n" +
  "• Keine leeren Zeilen zwischen Stichpunkten\n" +
  "• NUR Stichpunkte – absolut nichts anderes\n";

const SYSTEM_EN =
  "You are a precise study assistant. Convert the following text into " +
  "Markdown bullet points in ENGLISH.\n\n" +
  "STRICT FORMAT RULES – NO EXCEPTIONS:\n" +
  "• Every line starts with \"- \" (dash + space)\n" +
  "• No headings, no numbered lists\n" +
  "• No introduction, no closing sentence\n" +
  "• No empty lines between bullets\n" +
  "• ONLY bullet points – absolutely nothing else\n";

export class PromptBuilder {
  /**
   * @param text          The source text to summarise
   * @param settings      Current plugin settings
   * @param knownNotes    Vault note basenames for WikiLinks
   * @param overrideLevel Override the bullet level (for Alt+R rotation)
   */
  static build(
    text:          string,
    settings:      PluginSettings,
    knownNotes:    string[] = [],
    overrideLevel?: BulletLevel
  ): string {
    const level  = overrideLevel ?? settings.bulletLevel;
    const lang:Language = settings.language ?? "de";
    const de     = lang === "de";

    // ── Assemble instruction blocks ──────────────────────────────────────────
    const system   = de ? SYSTEM_DE    : SYSTEM_EN;
    const brevity  = de ? BREVITY_DE   : BREVITY_EN;
    const levelStr = de ? LEVEL_DE[level] : LEVEL_EN[level];
    const examStr  = settings.examCompression ? (de ? EXAM_DE : EXAM_EN) : "";

    // ── WikiLinks ─────────────────────────────────────────────────────────────
    let wikiStr = "";
    if (settings.wikiLinks && knownNotes.length > 0) {
      const noteList = knownNotes.slice(0, 100).join(", ");
      wikiStr = de
        ? `\nWIKILINKS: Falls ein Begriff exakt einem Notiz-Titel entspricht, schreibe ihn als [[Begriff]]. Liste: ${noteList}. Nur Begriffe aus dieser Liste verlinken.`
        : `\nWIKILINKS: If a term exactly matches a note title, write it as [[term]]. List: ${noteList}. Only link terms from this list.`;
    }

    // ── Final prompt ─────────────────────────────────────────────────────────
    const taskLabel = de ? "AUFGABE" : "TASK";
    const textLabel = de ? "TEXT"    : "TEXT";
    const startLine = de
      ? "Stichpunkte (beginne sofort mit \"-\", kein Vorwort):"
      : "Bullets (start immediately with \"-\", no preamble):";

    return (
      `${system}\n` +
      `${brevity}\n\n` +
      `${taskLabel}: ${levelStr}${examStr}${wikiStr}\n\n` +
      `${textLabel}:\n"""\n${text}\n"""\n\n` +
      `${startLine}`
    );
  }
}
