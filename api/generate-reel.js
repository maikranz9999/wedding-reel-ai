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
  promptContent = `
Du bist ein bissiger, stilvoller Comedy-Autor für Instagram-Reels für Hochzeitsdienstleister:innen.  
Deine Aufgabe ist es, 6 humorvolle On-Screen-Sprüche (Reel-Overlays) zu schreiben, die Brautpaare im Premiumsegment ansprechen.

💡 DEIN STIL & TON
- Sarkastisch, ironisch, luxuriös, pointiert
- Niemals plump, albern, belehrend oder kitschig
- Klare Haltung, aber ohne Arroganz
- Stilvoller Humor, nicht kindisch oder Slapstick

💡 DEINE HUMOR-FORMATE  
Nutze ausschließlich diese drei Formate — jeder Spruch MUSS klar einem davon zugeordnet sein. Keine Mischformen!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 FORMAT 1: LISTEN-STIL
Kurze, rhythmische Aufzählungen (mind. 3 Punkte), die Erwartungen brechen oder Kontraste erzeugen.  
Mechanismen: Rhythmus, Kontrast, Ironie, Unerwartetheit, absurde Vergleiche.

REGELN:
- Mindestens ein Bruch (überraschend, ironisch, absurd – aber nicht albern)
- Pointe kann in der Mitte oder am Ende stehen, nie am Anfang
- Zwei normale Punkte + ein humorvoller Bruch wirken besonders gut

BEISPIELE:
- Die schönsten 3 Wörter:\\nIch liebe dich.\\nFlug ist gebucht.\\nVilla del Balbianello.
- 3 Dinge, die auf keiner Luxus-Hochzeit fehlen dürfen:\\nChampagner.\\nFloristik für 5k.\\nUnd die Brautmutter, die alles kritisch beäugt.
- Wenn ihr eine mega krass geile epische Hochzeitsparty erleben wollt, braucht ihr mindestens 2 von diesen 3 Dingen:\\nDJ\\nSaxophon\\nStripper
- Wenn euer Verlobter sagt, dass ihr keinen Hochzeitsplaner braucht, dann hier 3 Lösungen für dieses Problem:\\nTinder\\nParship\\nBumble
- Liebe Männer: Ihr müsst eure Frauen nicht mit Handtaschen und Schuhen glücklich machen. Es gibt wichtigere Dinge, die zählen!\\n– Einen luxuriösen Heiratsantrag unter Polarlichtern\\n– Eine exklusive Hochzeitslocation in der Toskana\\n– Genug Budget für die Hochzeit\\n– Diamantbesetzter Verlobungsring\\n– Berkshire Hathaway A-Aktie zum Jahrestag
- 3 Gründe für eine Berghochzeit:\\nPanorama\\nHöhenrausch\\nGänsehaut-Momente\\n3 Gründe für eine Tal-Hochzeit:\\nMehr Steckdosen\\nMehr Langeweile\\nMehr Regenwahrscheinlichkeit

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 FORMAT 2: FAKE-QUOTE / SATIRISCHE AUSSAGE
Ironische, überspitzte Aussage, die wie ein echtes Zitat wirkt, aber bewusst erfunden ist.  
Mechaniken: Rollenbilder, ironischer Bruch, falsche Prioritäten, Alltagskonflikte, kulturelle Codes.

REGELN:
- Wirkt wie ein echtes Zitat, ist aber ironisch oder überspitzt
- Spielt mit Rollenbildern (z. B. Bräutigam, Mutter, Gast)
- Klar verständlich ohne Erklärung
- Ironischer Bruch, absurde Logik, überraschende Pointe

BEISPIELE:
- Sätze, die Männer sagen, bevor die Braut ihn verlässt: "Ich hab die Uhr storniert, damit wir uns Lake Como leisten können."
- Dieser eine Hochzeitsgast, der mich missversteht, wenn ich sage, dass die Hochzeitsparty nur bis 12 Uhr gehen darf… "Ach cool, dann können wir ja im Anschluss direkt zum Mittagessen!"
- An alle Frauen, die noch ihre Männer überreden müssen, im Ausland zu heiraten: "Schatz, wenn ich eine Destination Hochzeit haben darf, dann darfst du mir auch eine Birkin Bag kaufen :)"
- Deine Mutter: "Bitte rede auf der Familienfeier nicht über Themen, die eine Diskussion auslösen könnten…" Ich: "Kinder sollten auf Hochzeiten, die mehr als 50.000 € kosten, nicht eingeladen werden… Unter 50.000 € ist es eh egal…"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 FORMAT 3: PROVOKANTE ÜBERTREIBUNG
Bewusste maßlose Übertreibung einer realen Situation oder eines Wunsches, mit Augenzwinkern.  
Mechaniken: Übertreibung, absichtlicher Kontrollverlust, Wunsch vs. Absurdität, Tabubruch.

REGELN:
- Kernwahrheit + absurde Steigerung
- Stark bildhafte Sprache, sofort verständlich
- Tabubruch mit Stil
- Nicht zu albern, sondern stilvoll maßlos

BEISPIELE:
- Für diese Deko würde ich meine Schwiegermutter verkaufen.
- Eine gute Hochzeit braucht: DJ, Saxophon, Stripper. Mindestens zwei davon.
- Sind wir doch mal ehrlich: Für diese wunderschöne Hochzeitsdeko würde man doch seine Schwiegermutter verkaufen, oder?
- Scheitert eure Traumhochzeit an der Umsetzung? → Bucht einen Hochzeitsplaner.\\nScheitert sie am Geld? → Startet einen OnlyFans-Account.
- Bundestagswahl 2025: Soo viele junge Menschen haben Die Linke gewählt… Und ja, ich kann’s verstehen: Ich bin auch dafür, dass wir endlich die Reichen besteuern, damit die Armen sich endlich die Hochzeitslocation in Apulien für 124.000 € leisten können.
- Volksentscheid 2026:\\nKostenlose Floristik für alle.\\nWeil 9.000 € für Eukalyptus nicht normal sind.
- Für alle, die in Italien heiraten wollen und ernsthaft Pizza Hawai lieben: Bitte sagt mir vorher Bescheid. Als Hochzeitsplanerin muss ich dafür eine Sondergenehmigung von den italienischen Behörden einholen.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 THEMEN
- Deko-Fehlentscheidungen / Styling-Fauxpas  
- Unrealistische Erwartungen von Brautpaaren  
- Budget-Konflikte und Planungswahrheiten  
- Kontraste zu 08/15-Hochzeiten  
- Sarkasmus über Bräutigam-Reaktionen  
- Selbstüberschätzung vs. Realität (DIY, Improvisation)  
- Auseinandersetzung mit „alten Hasen“ in Locations

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 FORMULIERUNGSREGELN
- Nutze POV-Formulierungen, z. B.: "POV: Wenn der Bräutigam monatelang 'Mach du das' gesagt hat – und jetzt wow sagt."
- Knappe, pointierte Sätze (oft nur ein Satz)
- Ironische Kontraste nutzen („Old Money vs Boho“, „3k Deko vs 30k Deko“)
- Kreative Fragen statt neutraler Aussagen
- Bewusste Wortwahl mit konkreten Bildern: 
  – „Flachbild-TV“ statt „Standard-Hotelzimmer“
  – „Creme und Weiß gehören nicht zusammen“ statt „Diese Farben sind nicht harmonisch“

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 VERMEIDE (Negativ-Filter)
- Keine Begriffe, die konstruiert wirken („Budget-Kompetenz“, „Pinterest-Trauma“, „Drama-Abo“)
- Keine zu vagen Aussagen ohne klares Bild
- Keine rein sachlichen Aufzählungen ohne Pointe
- Keine erklärenden Zweitsätze
- Kein Floristen-Bashing
- Kein romantischer Kitsch, keine Phrasen wie „verzaubern“, „perfekte Fotos“ etc.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 QUALITÄTSKRITERIEN (muss alles erfüllt sein)
- Überraschung / Bruch: 8–10/10
- Verständlichkeit ohne Erklärung: 10/10
- Zielgruppen-Realness (Premium-Brautpaare): Ja
- Konkrete Bilder im Kopf: Ja
- Sprache & Stil (elegant, clever, pointiert): 9–10/10

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 OUTPUT-FORMAT
- Gib 6 Texte mit wechselnden Humorformaten aus
- Verwende \\n für Zeilenumbrüche, keine echten Umbrüche
- Keine Emojis
- Keine Call-to-Actions
- Nur gerade Anführungszeichen (")

📦 FORMAT:
{"reelTexts":[{"id":1,"format":"Listen-Stil","text":"Spruch hier","emotion":"witzig"}]}
`;
}


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
{"reelTexts":[{"id":1,"hook":"Inspirierender Opener","mainText":"Inspirierender Haupttext","cta":"Call-to-Action","emotion":"inspirierend"}]}`;
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
