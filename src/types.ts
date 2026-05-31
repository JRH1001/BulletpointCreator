// ─── Types ────────────────────────────────────────────────────────────────────

export type BulletLevel = "short" | "normal" | "detailed";
export type OutputMode  = "smart" | "clipboard" | "insert" | "both";
export type Language    = "de" | "en";

export interface PluginSettings {
  geminiApiKey:    string;
  model:           string;
  outputMode:      OutputMode;
  bulletLevel:     BulletLevel;
  examCompression: boolean;
  wikiLinks:       boolean;
  language:        Language;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: PluginSettings = {
  geminiApiKey:    "",
  model:           "gemini-2.5-flash",
  outputMode:      "clipboard",
  bulletLevel:     "normal",
  examCompression: true,
  wikiLinks:       false,
  language:        "de",
};

// ─── Available Gemini Models ──────────────────────────────────────────────────

export const GEMINI_MODELS: string[] = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-pro",
  "gemini-3.0-flash",
  "gemini-3.0-flash-preview",
  "gemini-3.1-flash-lite",
  "gemini-3.1-flash-live-preview",
  "gemini-3.5-flash",
];

// ─── Regenerate rotation ──────────────────────────────────────────────────────
// Alt+R cycles:  normal → detailed → short → normal …
export const LEVEL_ROTATION: BulletLevel[] = ["normal", "detailed", "short"];
