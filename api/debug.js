// api/debug.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  try {
    // Environment Check
    const envCheck = {
      hasApiKey: !!process.env.CLAUDE_API_KEY,
      apiKeyLength: process.env.CLAUDE_API_KEY?.length || 0,
      apiKeyPreview: process.env.CLAUDE_API_KEY?.substring(0, 12) + '...' || 'MISSING',
      model: process.env.CLAUDE_MODEL || 'default',
      allEnvVars: Object.keys(process.env).filter(key => key.includes('CLAUDE')),
      nodeVersion: process.version,
      timestamp: new Date().toISOString()
    };

    // Test Anthropic Import
    let anthropicTest = { status: 'not tested', error: null };
    try {
      const { default: Anthropic } = await import('@anthropic-ai/sdk');
      anthropicTest.status = 'import success';
      
      if (process.env.CLAUDE_API_KEY) {
        const anthropic = new Anthropic({
          apiKey: process.env.CLAUDE_API_KEY,
        });
        anthropicTest.status = 'sdk initialized';
        
        // Test actual API call with simple prompt
        try {
          const testMessage = await anthropic.messages.create({
            model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Hi' }]
          });
          anthropicTest.status = 'api call success';
          anthropicTest.response = testMessage.content[0]?.text || 'no text';
        } catch (apiError) {
          anthropicTest.status = 'api call failed';
          anthropicTest.error = {
            message: apiError.message,
            status: apiError.status,
            type: apiError.name
          };
        }
      }
    } catch (importError) {
      anthropicTest.status = 'import failed';
      anthropicTest.error = importError.message;
    }

    return res.status(200).json({
      success: true,
      message: 'Debug endpoint working',
      environment: envCheck,
      anthropicSDK: anthropicTest,
      requestMethod: req.method,
      userAgent: req.headers['user-agent']
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Debug endpoint failed',
      details: error.message,
      stack: error.stack
    });
  }
}
