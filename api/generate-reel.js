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
    const { backgroundVideo, service, style } = req.body;

    if (!backgroundVideo || !service || !style) {
      return res.status(400).json({ success: false, error: 'Missing fields' });
    }

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `Erstelle 3 Instagram Reel Texte für: Video: ${backgroundVideo}, Service: ${service}, Stil: ${style}. Format: {"reelTexts":[{"id":1,"hook":"TEST","mainText":"Text hier","cta":"CTA hier","emotion":"Emotion"}]}`
      }]
    });

    const response = message.content[0].text;
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch[0]);

    return res.status(200).json({
      success: true,
      reelTexts: parsed.reelTexts || []
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
