# BulletpointCreator
A simple Obsidian Addon that uses Gemini API to generate a list of Bullet points from a marked text from a PDF. Vibe Coded

**Select text → Alt+Q → Ctrl+V into your notes.**

---

## How it works

1. Open a PDF in Obsidian
2. Select a passage with your mouse
3. Press `Alt+Q`
4. Switch to your note and press `Ctrl+V`

Output is always clean bullet points — no headings, no sentences, no fluff:

```
- ATP → universal energy carrier
- Mitochondria → produce ATP via cellular respiration
- ADP + Pᵢ + energy → ATP (phosphorylation)
```

---

## Hotkeys

| Key | Action |
|-----|--------|
| `Alt+Q` | Generate bullets from selection |
| `Alt+A` | Add selection to buffer (collect multiple sections) |
| `Alt+R` | Regenerate — cycles through Normal → Detailed → Short |

---

## Installation

> Requires [Node.js](https://nodejs.org/) v18+ and Obsidian 1.12+

```bash
# 1. Copy the folder into your vault's plugin directory
<your-vault>/.obsidian/plugins/pdf-bullet-helper/

# 2. Install and build
npm install
npm run build

# 3. Enable in Obsidian → Settings → Community Plugins
```

Then add your free [Gemini API key](https://aistudio.google.com/apikey) under **Settings → PDF Bullet Helper**.

---

## Settings

| Setting | Description |
|---------|-------------|
| Gemini API Key | Your Google AI Studio key |
| Model | Gemini model — `gemini-2.5-flash` recommended |
| Output Language | 🇩🇪 German or 🇬🇧 English bullets |
| Output Mode | Clipboard / Smart / Insert / Both |
| Detail Level | Short (2–3) · Normal (4–8) · Detailed (up to 15) |
| Exam Compression | Only include exam-relevant points |
| WikiLinks | Auto-link existing vault notes as `[[note]]` |

---

## License

Whatever you want
