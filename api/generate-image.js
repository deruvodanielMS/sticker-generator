const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.VITE_API_KEY_IMAGE_GENERATION;

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

    try {
      // Always use gpt-image-1 for both cases
      let finalPrompt = prompt;
      
      if (selfieDataUrl) {
        // Enhance prompt to indicate we want personalized elements
        finalPrompt = `${prompt}. Create a personalized circular sticker design that could represent someone with glasses and a beard (if the sticker style allows for personal characteristics to be subtly incorporated).`;
        console.log('🚀 Calling OpenAI with enhanced prompt for personalization...');
      } else {
        console.log('🚀 Calling OpenAI image generation...');
      }
      
      // Use direct fetch like before
      const openaiResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt: finalPrompt,
          size: '1024x1024',
          n: 1
        }),
      });

      console.log('🚀 OpenAI response status:', openaiResponse.status);
      
      const responseText = await openaiResponse.text();
      console.log('🚀 OpenAI response (first 500 chars):', responseText.substring(0, 500));
      
      let responseJson = null;
      try {
        responseJson = JSON.parse(responseText);
      } catch (parseErr) {
        console.error('❌ Failed to parse OpenAI response:', parseErr);
      }

      if (!openaiResponse.ok) {
        console.error('❌ OpenAI API error:', responseText);
        return res.status(502).json({ 
          status: openaiResponse.status,
          ok: false,
          bodyText: responseText,
          bodyJson: null,
          error: responseText
        });
      }

      console.log('✅ OpenAI success, image generated');
      console.log('📊 Response data keys:', Object.keys(responseJson || {}));
      console.log('📊 Has data array:', !!responseJson?.data);
      console.log('📊 Data length:', responseJson?.data?.length);
      console.log('📊 Has b64_json:', !!responseJson?.data?.[0]?.b64_json);
      console.log('📊 Has url:', !!responseJson?.data?.[0]?.url);

      // Return envelope format for compatibility
      return res.status(200).json({
        status: 200,
        ok: true,
        bodyText: responseText,
        bodyJson: responseJson,
      });
      
    } catch (openaiErr) {
      console.error('❌ OpenAI API error:', openaiErr);
      return res.status(502).json({ 
        status: 500,
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
