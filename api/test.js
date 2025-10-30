// Test-Endpoint um zu prüfen ob die API grundsätzlich funktioniert

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

  try {
    // Environment Check
    const envCheck = {
      hasApiKey: !!process.env.CLAUDE_API_KEY,
      apiKeyLength: process.env.CLAUDE_API_KEY?.length || 0,
      apiKeyPreview: process.env.CLAUDE_API_KEY ? 
        process.env.CLAUDE_API_KEY.substring(0, 8) + '...' : 'MISSING',
      model: process.env.CLAUDE_MODEL || 'claude-3-sonnet',
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };

    console.log('Test Endpoint Called:', envCheck);

    // Test Anthropic Import
    let anthropicTest = 'Not tested';
    try {
      const { default: Anthropic } = await import('@anthropic-ai/sdk');
      anthropicTest = 'Import successful';
      
      if (process.env.CLAUDE_API_KEY) {
        const anthropic = new Anthropic({
          apiKey: process.env.CLAUDE_API_KEY,
        });
        anthropicTest = 'SDK initialized successfully';
      }
    } catch (importError) {
      anthropicTest = 'Import failed: ' + importError.message;
    }

    return res.status(200).json({
      success: true,
      message: 'Test endpoint working',
      environment: envCheck,
      anthropicSDK: anthropicTest,
      requestInfo: {
        method: req.method,
        headers: Object.keys(req.headers),
        hasBody: !!req.body
      }
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Test endpoint failed',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
