import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { backgroundVideo, service, style, optionalIdea } = req.body;

    // Validation
    if (!backgroundVideo || !service || !style) {
      return res.status(400).json({ 
        error: 'Pflichtfelder fehlen: backgroundVideo, service und style sind erforderlich' 
      });
    }

    // Style-spezifische Richtlinien
    const styleGuidelines = {
      inspiration: {
        name: "Emotional",
        tone: "Romantisch, träumerisch, herzberührend. Verwende Wörter wie 'Magie', 'Träume', 'Ewigkeit', 'Herz'. Fokus auf Gefühle und besondere Momente.",
        examples: "Der Moment..., Wenn Träume..., Eure Liebe..."
      },
      funny: {
        name: "Humorvoll", 
        tone: "Locker, charmant, augenzwinkernd. Verwende Worte wie 'Oops', 'Plot Twist', 'Real Talk'. Humor ohne Kitsch, sympathisch und bodenständig.",
        examples: "Plot Twist:..., Real Talk..., Niemand sagt dir..."
      },
      realtalk: {
        name: "Authentisch",
        tone: "Ehrlich, vertrauensvoll, persönlich. Verwende 'Ehrlich gesagt', 'Die Wahrheit ist', 'Behind the Scenes'. Zeige Expertise und Erfahrung.",
        examples: "Die Wahrheit über..., Ehrlich gesagt..., Was niemand sagt..."
      }
    };

    const selectedStyleGuide = styleGuidelines[style] || styleGuidelines.inspiration;

    // Hauptprompt für Claude
    const prompt = `Du bist ein Experte für Instagram Reel Content speziell für Hochzeitsdienstleister. Erstelle 6 verschiedene Overlay-Text-Varianten für ein Instagram Reel.

KONTEXT:
Video-Inhalt: "${backgroundVideo}"
Hochzeitsservice: "${service}"
Gewünschter Stil: ${selectedStyleGuide.name}
${optionalIdea ? `Zusätzliche Idee: "${optionalIdea}"` : ''}

STIL-RICHTLINIEN FÜR "${selectedStyleGuide.name.toUpperCase()}":
${selectedStyleGuide.tone}

AUSGABE-FORMAT (JSON):
Erstelle EXAKT 6 Varianten als JSON Array. Jede Variante soll haben:
- "hook": Ein starker, kurzer Hook (1-3 Wörter, GROSS geschrieben)
- "mainText": Haupttext (2-3 kurze Zeilen, max 60 Zeichen pro Zeile)
- "cta": Call-to-Action (1 Zeile, zum Handeln auffordern)
- "timing": Empfohlenes Timing (z.B. "0-2s: Hook, 2-6s: Main, 6-8s: CTA")
- "emotion": Haupt-Emotion die angesprochen wird

WICHTIGE REGELN:
1. Jede Variante muss ANDERS sein (verschiedene Hooks, verschiedene Ansätze)
2. Verwende Emojis sparsam und gezielt
3. Texte müssen auf Handy-Screens gut lesbar sein
4. Fokus auf BUCHUNGEN generieren, nicht nur Likes
5. Berücksichtige, dass Brautpaare die Zielgruppe sind
6. Hooks sollen neugierig machen und zum Weiterschauen animieren

BEISPIEL STRUKTUR:
[
  {
    "hook": "PLOT TWIST",
    "mainText": "Der Fotograf war\\nnervöser als\\ndie Braut 😅",
    "cta": "Wer kennt's? 👇",
    "timing": "0-2s: Hook, 2-5s: Main, 5-7s: CTA",
    "emotion": "Humor"
  }
]

Erstelle 6 solche Varianten im JSON Format:`;

    // Claude API Call
    const message = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.8,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const responseText = message.content[0].text;
    
    // Versuche JSON zu parsen
    let reelTexts;
    try {
      // Finde JSON im Response (falls Claude extra Text drumherum schreibt)
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        reelTexts = JSON.parse(jsonMatch[0]);
      } else {
        reelTexts = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Claude Response:', responseText);
      
      // Fallback: Manuell parsen wenn JSON fehlschlägt
      reelTexts = [{
        hook: "FEHLER",
        mainText: "Es gab einen Fehler\\nbeim Generieren.\\nVersuche es erneut.",
        cta: "Nochmal versuchen",
        timing: "0-8s: Fehlermeldung",
        emotion: "Entschuldigung"
      }];
    }

    // Validiere Response
    if (!Array.isArray(reelTexts) || reelTexts.length === 0) {
      throw new Error('Keine gültigen Reel-Texte generiert');
    }

    // Stelle sicher, dass alle erforderlichen Felder vorhanden sind
    const validatedTexts = reelTexts.map((text, index) => ({
      id: index + 1,
      hook: text.hook || "HOOK",
      mainText: text.mainText || "Haupttext hier",
      cta: text.cta || "Mehr erfahren",
      timing: text.timing || "0-8s: Vollständiger Text",
      emotion: text.emotion || "Interesse",
      style: selectedStyleGuide.name
    }));

    return res.status(200).json({
      success: true,
      reelTexts: validatedTexts,
      metadata: {
        style: selectedStyleGuide.name,
        count: validatedTexts.length,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    
    return res.status(500).json({
      error: 'Fehler bei der Text-Generierung',
      details: error.message,
      success: false
    });
  }
}
