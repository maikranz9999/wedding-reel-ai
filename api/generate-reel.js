export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { backgroundVideo, service, style, optionalIdea } = req.body;

    if (!backgroundVideo || !service || !style) {
      return res.status(400).json({ success: false, error: 'Missing fields' });
    }

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

    // Detaillierter Prompt je nach Stil
    let promptContent = '';

    if (style === 'funny') {
      promptContent = `Du bist ein kreativer Ideengeber für witzige Instagram-Reel-Texte für Hochzeitsdienstleister im Premiumsegment.

AUFGABE: Erstelle 6 witzige Reel-Texte basierend auf:
- Video-Inhalt: ${backgroundVideo}
- Service: ${service}
${optionalIdea ? `- Zusätzliche Idee: ${optionalIdea}` : ''}

HUMOR-FORMATE (nutze verschiedene davon):

1. LISTEN-STIL:
- 3+ rhythmische Punkte mit mindestens einem ironischen Bruch
- Pointe NICHT am Anfang, sondern Mitte/Ende
- Beispiel: "3 Dinge für eine Luxus-Hochzeit: Champagner. Floristik für 5k. Und die Brautmutter, die alles kritisch beäugt."

2. FAKE-QUOTE / SATIRISCHE AUSSAGE:
- Ironische "Zitate" von Personen (Bräutigam, Gäste, etc.)
- Spielt mit Klischees und absurden Prioritäten
- Beispiel: "Sätze, die Männer sagen, bevor die Braut ihn verlässt: 'Ich hab die Uhr storniert, damit wir uns Lake Como leisten können.'"

3. PROVOKANTE ÜBERTREIBUNG:
- Kernwahrheit + absurde Steigerung mit Augenzwinkern
- Nicht albern, aber bewusst maßlos
- Beispiel: "Für diese Deko würde ich meine Schwiegermutter verkaufen."

STIL-REGELN:
- Nutze POV-Formulierungen: "POV: Wenn der Bräutigam monatelang 'Mach du das' gesagt hat – und jetzt wow sagt."
- Knappe, pointierte Sätze ohne erklärende Zweitsätze
- Ironische Kontraste einbauen
- Kreative Fragen statt neutrale Aussagen
- Bewusste Wortwahl: "Flachbild-TV" statt "Standard-Hotelzimmer"

THEMEN-FOKUS:
- Deko-Fehlentscheidungen/Styling-Fauxpas
- Unrealistische Brautpaar-Erwartungen
- Budget-Konflikte und Planungswahrheiten
- Premium vs. 08/15-Hochzeiten
- Bräutigam-Reaktionen und Selbstüberschätzung

WICHTIG:
- Niemals plump oder albern
- Immer witzig, clever und pointiert
- Zielgruppe: Brautpaare im Premiumsegment
- Jeder Text soll als Instagram Reel Overlay funktionieren

Erstelle 6 verschiedene Texte mit unterschiedlichen Humor-Formaten.

FORMAT (genau so ausgeben):
{"reelTexts":[{"id":1,"hook":"Kurzer Hook/Aufhänger","mainText":"Haupttext hier","cta":"Call-to-Action","emotion":"witzig"}]}`;

    } else if (style === 'inspiration') {
      promptContent = `Erstelle 6 emotionale, romantische Instagram Reel Texte für:
Video: ${backgroundVideo}
Service: ${service}
${optionalIdea ? `Idee: ${optionalIdea}` : ''}

Stil: Emotional, träumerisch, herzberührend. Fokus auf Gefühle und magische Momente.

FORMAT: {"reelTexts":[{"id":1,"hook":"Hook","mainText":"Text","cta":"CTA","emotion":"emotional"}]}`;

    } else if (style === 'realtalk') {
      promptContent = `Erstelle 6 authentische, ehrliche Instagram Reel Texte für:
Video: ${backgroundVideo}
Service: ${service}
${optionalIdea ? `Idee: ${optionalIdea}` : ''}

Stil: Authentisch, persönlich, vertrauensvoll. Zeige echte Expertise und baue Vertrauen auf.

FORMAT: {"reelTexts":[{"id":1,"hook":"Hook","mainText":"Text","cta":"CTA","emotion":"authentisch"}]}`;
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: promptContent
      }]
    });

    const response = message.content[0].text;
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Kein gültiges JSON in der Antwort gefunden');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);

    return res.status(200).json({
      success: true,
      reelTexts: parsed.reelTexts || []
    });

  } catch (error) {
    console.error('Generation Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      details: 'Fehler bei der Text-Generierung'
    });
  }
}
