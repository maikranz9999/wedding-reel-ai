# 💍 Reel Text AI für Hochzeitsdienstleister

Ein KI-gestütztes Tool zur Erstellung emotionaler Instagram Reel Overlay-Texte speziell für Hochzeitsdienstleister.

## 🚀 Features

- **Hochzeits-spezifische KI-Prompts** für perfekte Reel-Texte
- **3 Stil-Optionen**: Emotional, Humorvoll, Authentisch
- **6 Varianten pro Generierung** mit unterschiedlichen Ansätzen
- **Copy-to-Clipboard** Funktion für einfache Nutzung
- **Responsive Design** für alle Geräte
- **Timing-Empfehlungen** für optimale Reel-Struktur

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Backend**: Vercel Serverless Functions
- **KI**: Claude 3 Sonnet (Anthropic API)
- **Hosting**: Vercel

## 📦 Installation & Setup

### 1. Repository klonen
```bash
git clone https://github.com/yourusername/wedding-reel-ai.git
cd wedding-reel-ai
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. Umgebungsvariablen setzen
Erstelle eine `.env.local` Datei:
```env
CLAUDE_API_KEY=your_anthropic_api_key_here
CLAUDE_MODEL=claude-3-sonnet-20240229
```

### 4. Lokal entwickeln
```bash
npm run dev
# oder
vercel dev
```

### 5. Auf Vercel deployen
```bash
# Mit Vercel CLI
vercel

# Oder verbinde dein GitHub Repository mit Vercel Dashboard
```

## 🔧 Vercel Setup

### Umgebungsvariablen in Vercel Dashboard setzen:
1. Gehe zu deinem Vercel Projekt
2. Settings → Environment Variables
3. Füge hinzu:
   - `CLAUDE_API_KEY`: Dein Anthropic API Key
   - `CLAUDE_MODEL`: `claude-3-sonnet-20240229`

### Automatisches Deployment:
- Push zu `main` Branch = automatisches Deployment
- Pull Requests = Preview Deployments

## 📁 Dateistruktur

```
wedding-reel-ai/
├── public/
│   └── index.html          # Frontend UI
├── api/
│   └── generate-reel.js    # Vercel API Route für Claude
├── package.json            # Dependencies
├── vercel.json            # Vercel Konfiguration
└── README.md              # Diese Datei
```

## 🎯 API Endpunkt

### POST `/api/generate-reel`

**Request Body:**
```json
{
  "backgroundVideo": "Beschreibung des Videos",
  "service": "Hochzeitsservice",
  "style": "inspiration|funny|realtalk",
  "optionalIdea": "Zusätzliche Idee (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "reelTexts": [
    {
      "id": 1,
      "hook": "MOMENT",
      "mainText": "Wenn der Ring\nperfekt sitzt...\nUnbezahlbar! ✨",
      "cta": "Buche deinen Moment 💍",
      "timing": "0-2s: Hook, 2-6s: Main, 6-8s: CTA",
      "emotion": "Romantik",
      "style": "Emotional"
    }
  ],
  "metadata": {
    "style": "Emotional",
    "count": 6,
    "generatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🎨 Anpassungen

### Neue Stile hinzufügen:
1. Erweitere `styleGuidelines` in `api/generate-reel.js`
2. Füge HTML für neuen Style-Button in `public/index.html` hinzu
3. CSS-Styling anpassen

### Prompt-Optimierung:
- Bearbeite den Hauptprompt in `api/generate-reel.js`
- Teste verschiedene `temperature` Werte (0.7-0.9)
- Experimentiere mit verschiedenen Claude Modellen

## 📱 Verwendung

1. **Video beschreiben**: Was passiert in deinem Hochzeitsvideo?
2. **Service definieren**: Welchen Hochzeitsservice bietest du an?
3. **Stil wählen**: Emotional, Humorvoll oder Authentisch
4. **Optional**: Zusätzliche Ideen eingeben
5. **Generieren**: 6 verschiedene Reel-Text Varianten erhalten
6. **Kopieren**: Mit einem Klick in die Zwischenablage

## 🔒 Sicherheit

- API Key wird nur serverseitig verwendet
- Rate Limiting durch Vercel implementiert
- CORS korrekt konfiguriert
- Input Validation & Sanitization

## 🆘 Troubleshooting

### API Fehler:
- Überprüfe Anthropic API Key
- Kontrolliere Vercel Logs: `vercel logs`
- Teste API lokal: `vercel dev`

### Deployment Probleme:
- Vergewissere dich, dass alle Environment Variables gesetzt sind
- Überprüfe `vercel.json` Konfiguration
- Teste Build lokal: `vercel build`

## 📄 Lizenz

MIT License - siehe LICENSE Datei für Details.

## 🤝 Contributing

Pull Requests sind willkommen! Für größere Änderungen bitte zuerst ein Issue erstellen.

## 📞 Support

Bei Fragen oder Problemen erstelle ein GitHub Issue oder kontaktiere [deine Email].

---

**Made with 💍 for Wedding Professionals**
