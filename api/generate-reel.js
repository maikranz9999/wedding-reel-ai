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

WICHTIG für das JSON-Format:
- Verwende nur gerade Anführungszeichen (")
- Keine Zeilenumbrüche im Text
- Verwende \\n für Zeilenumbrüche
- Escape alle Sonderzeichen korrekt

Erstelle 6 verschiedene Texte mit unterschiedlichen Humor-Formaten.

FORMAT (genau so ausgeben):
{"reelTexts":[{"id":1,"mainText":"Haupttext hier"}]}`;

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
{"reelTexts":[{"id":1,"mainText":"Haupttext hier"}]}`;

    } else if (style === 'inspiration') {
      promptContent = `Du erstellst inspirierende Instagram Reel Texte für Hochzeitsdienstleister im Premiumsegment.

AUFGABE: Erstelle 6 Inspirations-Texte basierend auf:
- Video-Inhalt: ${backgroundVideo}
- Service: ${service}
${optionalIdea ? `- Zusätzliche Idee: ${optionalIdea}` : ''}

ZWEI INSPIRATION-ARTEN:

1. HARTE INSPIRATION (Educational Content):
- Konkrete Tipps, Ratschläge, Empfehlungen
- Fahrpläne und actionable Listen
- Echter Mehrwert und Expertise
- Beispiele: "10 Tipps für Hochzeitslocation-Buchung", "5 Must-Haves für Old Money Style", "3 Fehler bei der Dienstleister-Auswahl"

2. SOFTE INSPIRATION (Vibes & Stimmung):
- Beschreibt das Hintergrundvideo poetisch aber NICHT kitschig
- Leichte Kost, emotionale Sprache ohne Übertreibung
- Stimmungsvolle Aussagen mit Substanz
- Fokus auf Gefühl und Atmosphäre
- Das Hintergrundvideo muss IMMER mitspielen und zur Aussage passen

BEISPIELE FÜR SOFTE INSPIRATION:

POV-Style:
- "POV: Stilvoll feiern heißt Positivität sichtbar und spürbar zu machen. Keine Langeweile, nur Flow."
- "POV: Du bist ein absoluter Pizza-Lover und buchst dir für dein Hochzeitswochenende eine Pizza Ape statt eines Fünfgänge-Menüs"
- "POV: Dein Getting Ready findet in einer 500-Jahre-alten Villa statt und fühlt sich an wie Zeitreise"
- "POV: Wenn deine Gäste das erste Mal die Location sehen und einfach nur still werden"
- "POV: Du sagst JA und im Hintergrund rauscht das Meer - mehr Soundtrack braucht man nicht"
- "POV: Du heiratest an der Ostsee und dein Dinner findet im offenen Meer statt."

Atmosphärische Beschreibungen:
- "Es geht nicht um mehr, sondern um das was bleibt: unvergessliche Hochzeitsmomente stilvoll geplant, echt erlebt."
- "Für mich bedeutet eine Luxushochzeit keine Übertreibung. Sondern Ruhe, Vertrauen und echte Leichtigkeit"
- "Wenn Eleganz auf Authentizität trifft. Keine Show, nur echte Momente."
- "Manche Orte erzählen ihre eigene Geschichte. Du musst nur zuhören."
- "Es sind nicht die großen Gesten. Es sind die stillen Sekunden, die bleiben."
- "champagne showers & main character energy."

Video-bezogene Statements:
- "Für die, die sich immer noch fragen, ob sie in Deutschland oder in Italien heiraten sollen. Schaut euch einfach das hier an."
- "Stellt euch vor, dass es die Anreise eurer Hochzeitsgäste vom Vorabend - allein dafür lohnt es sich schon, in Italien zu heiraten ❤️"
- "Für alle, die verstehen: Luxus ist, wenn nichts forciert werden muss"
- "Seht ihr dieses Licht? Genau dafür plant man eine Hochzeit in der Toskana"
- "Diese Aussicht. Diese Ruhe. Deshalb heiratet man auf einem Weingut."

Kurze, prägnante Aussagen:
- "Weniger Drama, mehr Magie"
- "Quality over Quantity. Immer."
- "Wenn der Ort schon perfekt ist, muss man ihn nur noch leben lassen"

WICHTIGE REGELN FÜR SOFTE INSPIRATION:
- NIEMALS kitschig oder übertrieben romantisch werden
- Keine abgedroschenen Phrasen wie "Märchenhochzeit", "Traumtag", "wie im Märchen"
- Stattdessen: Elegant, stilvoll, authentisch formulieren
- Das Hintergrundvideo steht im Mittelpunkt
- Leichte, aber substanzielle Sprache
- Texte müssen zum Video-Inhalt passen

TONALITÄT:
- Inspirierend aber authentisch
- Elegant ohne Kitsch
- Emotional aber nicht übertrieben
- Stilvoll und hochwertig
- Fokus auf echte Momente statt Fantasy

THEMEN FÜR INSPIRATION:
- Stilvolle Hochzeitsplanung
- Qualität über Quantität
- Echte Emotionen und Momente
- Ästhetik und Design
- Persönliche Details
- Zeitlose Eleganz

WICHTIG für das JSON-Format:
- Verwende nur gerade Anführungszeichen (")
- Keine Zeilenumbrüche im Text
- Verwende \\n für Zeilenumbrüche
- Escape alle Sonderzeichen korrekt

FORMAT (genau so ausgeben):
{"reelTexts":[{"id":1,"mainText":"Haupttext hier"}]}`;
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: promptContent
      }]
    });

    const response = message?.content?.[0]?.text ?? '';
console.log('Raw AI Response:', response);

// Codefences entfernen (falls Claude sie setzt) und nur das erste {...} nehmen
const withoutFences = response.replace(/```json|```/g, '').trim();
const jsonMatch = withoutFences.match(/\{[\s\S]*\}/);

if (!jsonMatch) throw new Error('Kein gültiges JSON in der Antwort gefunden');

// WICHTIG: NICHT mehr manuell replacen/escapen!
const parsed = JSON.parse(jsonMatch[0]);

// Nur mainText verwenden (robust, falls das Modell doch mehr Felder sendet)
const reelTexts = Array.isArray(parsed.reelTexts)
  ? parsed.reelTexts
      .map((it, idx) => ({
        id: Number(it?.id ?? idx + 1),
        mainText: String(it?.mainText ?? '').trim()
      }))
      .filter(it => it.mainText.length > 0)
  : [];

return res.status(200).json({
  success: true,
  reelTexts
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

