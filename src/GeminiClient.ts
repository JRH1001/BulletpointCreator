// ─── GeminiClient ─────────────────────────────────────────────────────────────
// Talks to the Gemini generateContent REST endpoint.

const API_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  error?: { message?: string; code?: number };
}

export class GeminiClient {
  private apiKey: string;
  private model:  string;

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model  = model;
  }

  updateCredentials(apiKey: string, model: string): void {
    this.apiKey = apiKey;
    this.model  = model;
  }

  async generate(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error(
        "Kein API-Schlüssel gesetzt. Bitte in den Plugin-Einstellungen eintragen."
      );
    }

    const url = `${API_BASE}/${this.model}:generateContent?key=${this.apiKey}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature:      0.25,
            maxOutputTokens:  2048,
            topP:             0.8,
            topK:             40,
          },
          // Allow all safety categories so academic content isn't blocked
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH",       threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          ],
        }),
      });
    } catch (networkErr) {
      throw new Error(
        `Netzwerkfehler beim Verbinden mit Gemini: ${String(networkErr)}`
      );
    }

    const data: GeminiResponse = await response.json().catch(() => ({}));

    if (!response.ok) {
      const msg = data?.error?.message ?? `HTTP ${response.status}`;
      throw new Error(`Gemini API Fehler: ${msg}`);
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      const reason = data?.candidates?.[0]?.finishReason ?? "unbekannt";
      throw new Error(
        `Gemini hat keinen Text zurückgegeben (finishReason: ${reason}).`
      );
    }

    return text.trim();
  }
}
