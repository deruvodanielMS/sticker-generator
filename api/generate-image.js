import OpenAI from 'openai';

const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.VITE_API_KEY_IMAGE_GENERATION;

const openai = new OpenAI({
  apiKey: OPENAI_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    console.log('🔑 OPENAI_KEY present:', !!OPENAI_KEY);
    console.log('🔑 OPENAI_KEY first 10 chars:', OPENAI_KEY?.substring(0, 10));
    
    if (!OPENAI_KEY) return res.status(500).json({ error: 'Server missing OPENAI key' });
    
    const { prompt, selfieDataUrl } = req.body || {};
    console.log('📝 Prompt received:', prompt?.substring(0, 100) + '...');
    console.log('📸 Selfie provided:', !!selfieDataUrl);
    
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    let result;
    try {
      if (selfieDataUrl) {
        // For image edits, we need to use the edits endpoint
        // Convert data URL to buffer
        const match = selfieDataUrl.match(/^data:(.*);base64,(.*)$/);
        if (!match) return res.status(400).json({ error: 'Invalid selfie data URL' });
        const b64 = match[2];
        const buffer = Buffer.from(b64, 'base64');
        
        console.log('🚀 Calling OpenAI image edit...');
        result = await openai.images.edit({
          image: buffer,
          prompt: prompt,
          size: "1024x1024",
          n: 1
        });
      } else {
        console.log('🚀 Calling OpenAI image generation...');
        result = await openai.images.generate({
          model: "gpt-image-1",
          prompt: prompt,
          size: "1024x1024",
          n: 1
        });
      }
      
      console.log('✅ OpenAI success, image generated');
      
      // Return envelope format for compatibility
      return res.status(200).json({
        status: 200,
        ok: true,
        bodyText: JSON.stringify(result),
        bodyJson: result,
      });
      
    } catch (openaiErr) {
      console.error('❌ OpenAI API error:', openaiErr);
      return res.status(502).json({ 
        status: openaiErr.status || 500,
        ok: false,
        bodyText: String(openaiErr?.message || openaiErr),
        bodyJson: null,
        error: String(openaiErr?.message || openaiErr) 
      });
    }
  } catch (err) {
    console.error('❌ General error:', err);
    return res.status(500).json({ error: String(err?.message || err) });
  }
}
