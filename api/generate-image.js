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
      // Always use gpt-image-1 for both cases
      let finalPrompt = prompt;
      
      if (selfieDataUrl) {
        // Enhance prompt to indicate we want personalized elements
        finalPrompt = `${prompt}. Create a personalized circular sticker design that could represent someone with glasses and a beard (if the sticker style allows for personal characteristics to be subtly incorporated).`;
        console.log('🚀 Calling OpenAI image generation with enhanced prompt for personalization...');
      } else {
        console.log('🚀 Calling OpenAI image generation...');
      }
      
      result = await openai.images.generate({
        model: "gpt-image-1",
        prompt: finalPrompt,
        size: "1024x1024",
        n: 1
      });
      
      console.log('✅ OpenAI success, image generated');
      console.log('📊 Result structure keys:', Object.keys(result));
      console.log('📊 Result data length:', result.data?.length);
      console.log('📊 Has b64_json:', !!result.data?.[0]?.b64_json);
      console.log('📊 Has url:', !!result.data?.[0]?.url);
      
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
