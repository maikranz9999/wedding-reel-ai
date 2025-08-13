export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // DEBUGGING: Environment Check
  console.log('=== ENVIRONMENT DEBUG ===');
  console.log('API Key exists:', !!process.env.CLAUDE_API_KEY);
  console.log('API Key length:', process.env.CLAUDE_API_KEY?.length || 0);
  console.log('Model:', process.env.CLAUDE_MODEL);
  console.log('Request method:', req.method);
  console.log('Request body:', JSON.stringify(req.body, null, 2));

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      method: req.method,
      success: false 
    });
  }

  // API Key Validation
  if (!process.env.CLAUDE_API_KEY) {
    console.error('❌ CLAUDE_API_KEY is missing!');
    return res.status(500).json({
      error: 'Server-Konfigurationsfehler: API-Schlüssel fehlt',
      success: false,
      debug: 'CLAUDE_API_KEY environment variable not set'
    });
  }

  if (!process.env.CLAUDE_API_KEY.startsWith('sk-ant-')) {
    console.error('❌ Invalid API Key format!');
    return res.status(500).json({
      error: 'Server-Konfigurationsfehler: Ungültiger API-Schlüssel',
      success: false,
      debug: 'API Key does not start with sk-ant-'
    });
  }

  try {
    // Destructure request body with defaults
    const {
      backgroundVideo = '',
      service = '',
      style = '',
      optionalIdea = ''
    } = req.body || {};

    // Input validation
    if (!backgroundVideo || !service || !style) {
      console.log('❌ Validation failed:', { 
        backgroundVideo: !!backgroundVideo, 
        service: !!service, 
        style: !!style 
      });
      return res.status(400).json({ 
        error: 'Pflichtfelder fehlen: backgroundVideo, service und style sind erforderlich',
        missing: {
          backgroundVideo: !backgroundVideo,
          service: !service,
          style: !style
        },
        success: false
      });
    }

    // Import Anthropic SDK
    let Anthropic;
    try {
      const anthropicModule = await import('@anthropic-ai/sdk');
      Anthropic = anthropicModule.default;
      console.log('✅ Anthropic SDK imported successfully');
    } catch (importError) {
      console.error('❌ Failed to import Anthropic SDK:', importError);
      return res.status(500).json({
        error: 'Server-Fehler: SDK kann nicht geladen werden',
        success: false,
        debug: importError.message
      });
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });

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
]`;

    console.log('Sending prompt to Claude...', {
      promptLength: prompt.length,
      style: selectedStyleGuide.name
    });

    // Claude API Call
    const message = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.8,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    console.log('Claude response received:', {
      contentLength: message.content[0]?.text?.length || 0,
      contentPreview: message.content[0]?.text?.substring(0, 100) + '...'
    });

    const responseText = message.content[0].text;
    
    // Versuche JSON zu parsen
    let reelTexts;
    try {
      // Reinige die Response von möglichem Extra-Text
      let cleanedResponse = responseText.trim();
      
      // Entferne mögliche Markdown Code-Blöcke
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Finde JSON Array im Response
      const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }
      
      console.log('Cleaned response for parsing:', cleanedResponse.substring(0, 200) + '...');
      
      reelTexts = JSON.parse(cleanedResponse);
      
      // Validiere dass es ein Array ist
      if (!Array.isArray(reelTexts)) {
        throw new Error('Response is not an array');
      }
      
      console.log('Successfully parsed JSON with', reelTexts.length, 'items');
      
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Original Claude Response:', responseText);
      
      // Fallback: Erstelle manuell ein Beispiel-Array
      reelTexts = [
        {
          hook: "MOMENT",
          mainText: "Wenn der Ring\\nperfekt sitzt...\\nUnbezahlbar! ✨",
          cta: "Buche deinen Moment 💍",
          timing: "0-2s: Hook, 2-6s: Main, 6-8s: CTA",
          emotion: "Romantik"
        },
        {
          hook: "GEHEIMNIS",
          mainText: "Das beste\\nHochzeitsfoto\\nentsteht ungestellt",
          cta: "Lass uns reden! 📞",
          timing: "0-2s: Hook, 2-5s: Main, 5-7s: CTA",
          emotion: "Neugier"
        },
        {
          hook: "WAHRHEIT",
          mainText: "99% aller Bräute\\nvergessen dieses\\nDetail... 🤵‍♀️",
          cta: "Was denkst du? 💭",
          timing: "0-2s: Hook, 2-6s: Main, 6-8s: CTA",
          emotion: "Spannung"
        }
      ];
      
      console.log('Using fallback reel texts due to parsing error');
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
    console.error('=== DETAILED ERROR LOG ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error status:', error.status);
    
    // Check if error response is HTML (Vercel error page)
    if (error.message && error.message.includes('<!DOCTYPE html>')) {
      console.error('❌ Received HTML error page instead of JSON');
      return res.status(500).json({
        error: 'Server-Fehler: Unerwartete HTML-Antwort',
        success: false,
        debug: 'API returned HTML instead of JSON - likely a Vercel configuration issue'
      });
    }

    // Specific error handling
    let statusCode = 500;
    let userMessage = 'Unbekannter Server-Fehler';

    if (error.message?.includes('API key')) {
      statusCode = 401;
      userMessage = 'API-Schlüssel ungültig';
    } else if (error.status === 429) {
      statusCode = 429;
      userMessage = 'Rate Limit erreicht. Bitte warten.';
    } else if (error.status === 400) {
      statusCode = 400;
      userMessage = 'Ungültige Anfrage';
    }

    return res.status(statusCode).json({
      error: userMessage,
      success: false,
      timestamp: new Date().toISOString(),
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
