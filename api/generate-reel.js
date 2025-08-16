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
- WICHTIG: Entweder jeder Punkt ist in sich abgeschlossen ODER alle bauen logisch aufeinander auf
- Keine Gedankensprünge zwischen den Punkten
- Beispiel: "DIY-Hochzeit Checkliste: 47 italienische Dienstleister googeln. Mit Google Translate verhandeln. Am Ende 150k statt 100k ausgeben. Nervenzusammenbruch inklusive."

2. FAKE-QUOTE / SATIRISCHE AUSSAGE:
- Das Zitat und die Erklärung müssen thematisch zusammenhängen
- Die Pointe muss aus dem Setup logisch folgen
- Beispiel: "Sätze, die Männer sagen, bevor die Braut ihn verlässt: 'Ich hab die Uhr storniert, damit wir uns Lake Como leisten können.'"

3. PROVOKANTE ÜBERTREIBUNG:
- Kernwahrheit + absurde Steigerung, aber mit logischer Verbindung
- Jeder Teil muss thematisch mit dem vorherigen verknüpft sein
- Beispiel: "Für diese Deko würde ich meine Schwiegermutter verkaufen."

STIL-REGELN:
- Nutze POV-Formulierungen: "POV: Wenn der Bräutigam monatelang 'Mach du das' gesagt hat – und jetzt wow sagt."
- Knappe, pointierte Sätze ohne erklärende Zweitsätze
- Ironische Kontraste einbauen
- Kreative Fragen statt neutrale Aussagen
- Bewusste Wortwahl: "Flachbild-TV" statt "Standard-Hotelzimmer"

LOGIK-REGELN (SEHR WICHTIG):
- Jeder Teil des Textes muss thematisch mit dem vorherigen verbunden sein
- KEINE Gedankensprünge oder abrupte Themenwechsel
- Die Pointe muss logisch aus dem Setup folgen
- Wenn du das Thema wechselst, baue eine logische Brücke
- Beispiel für SCHLECHT: "Wir haben alles im Griff" → italienisches Wort ohne Verbindung
- Beispiel für GUT: DIY-Planung → Google Translate → höhere Kosten → Nervenzusammenbruch (alles baut aufeinander auf)

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
      promptContent = `Du erstellst authentische, ehrliche Instagram Reel Texte für Hochzeitsdienstleister im Premiumsegment.

AUFGABE: Erstelle 6 "Realtalk"-Texte basierend auf:
- Video-Inhalt: ${backgroundVideo}
- Service: ${service}
${optionalIdea ? `- Zusätzliche Idee: ${optionalIdea}` : ''}

REALTALK-OPENER (nutze verschiedene davon):
- "Ich sags nur ungern, aber [unbequeme Wahrheit]"
- "Unbequeme Wahrheit, aber sie muss gesagt werden: [Tatsache]"
- "Ich kann es als [dein Service] absolut nicht verstehen, warum man immer noch denkt [Denkfehler]"
- "Bitte alle einmal laut & deutlich nachsprechen: [wichtige Botschaft]"
- "Ich weiß, die meisten Brautpaare wollen das nicht hören, aber..."
- "Hand aufs Herz: [unbequeme Frage]"
- "Sind wir doch mal ehrlich: [starke Meinung]"
- "Ehrlich gesagt, das wird einigen nicht gefallen: [kontroverse Meinung]"
- "Lasst uns bitte mal darüber reden, dass es nicht okay ist, wenn [problematisches Verhalten]"
- "Es ist an der Zeit, dass das mal gesagt wird (auch wenn ich mir damit keine Freunde mache)"
- "Warum redet eigentlich niemand über [Tabuthema] und welche Auswirkungen es auf [Konsequenz] hat?"

REALTALK-PRINZIPIEN:
- Unbequeme Wahrheiten aussprechen, die andere nicht sagen
- Expertise und Fachwissen betonen
- Direkte, ehrliche Ansprache ohne Schönfärberei
- Branchenprobleme oder Missverständnisse aufdecken
- Vertrauen durch Ehrlichkeit aufbauen
- Manchmal kontrovers, aber immer konstruktiv

TONALITÄT:
- Ehrlich und direkt
- Kompetent und vertrauensvoll
- Manchmal unbequem, aber nie verletzend
- Professionell trotz Kritik
- Hilfsbereit und lösungsorientiert

THEMEN FÜR REALTALK:
- Budgetmissverständnisse und versteckte Kosten
- Unrealistische Pinterest-Erwartungen vs. Realität
- Planungsfehler, die teuer werden
- Dienstleister-Auswahl und Qualitätsunterschiede
- Zeitplanung und Last-Minute-Probleme
- Gästemanagement und schwierige Familiendynamiken

WICHTIG für das JSON-Format:
- Verwende nur gerade Anführungszeichen (")
- Keine Zeilenumbrüche im Text
- Verwende \\n für Zeilenumbrüche
- Escape alle Sonderzeichen korrekt

FORMAT (genau so ausgeben):
{"reelTexts":[{"id":1,"hook":"Realtalk-Opener","mainText":"Ehrlicher Haupttext","cta":"Call-to-Action","emotion":"authentisch"}]}`;
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
    console.log('Raw AI Response:', response); // Debug
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Kein gültiges JSON in der Antwort gefunden');
    }
    
    // JSON bereinigen
    let jsonStr = jsonMatch[0]
      .replace(/[\n\r\t]/g, ' ') // Zeilenumbrüche entfernen
      .replace(/\\/g, '\\\\') // Backslashes escapen
      .replace(/"/g, '\\"') // Anführungszeichen escapen
      .replace(/\\"/g, '"') // Wieder rückgängig für JSON-Struktur
      .replace(/"\s*:\s*"/g, '":"') // Leerzeichen um Doppelpunkte entfernen
      .trim();
    
    console.log('Cleaned JSON:', jsonStr); // Debug
    
    const parsed = JSON.parse(jsonStr);

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
