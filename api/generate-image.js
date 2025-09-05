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
        // Use new Responses API with photo input
        console.log('🚀 Calling OpenAI Responses API with photo using gpt-4.1...');
        
        const response = await openai.responses.create({
          model: "gpt-4.1",
          input: [
            {
              role: "user",
              content: [
                { 
                  type: "input_text", 
                  text: `Generate a circular sticker image based on this prompt: ${prompt}. Use the person in the reference photo as inspiration for the character in the sticker. Make it creative and visually appealing as a circular sticker design.`
                },
                {
                  type: "input_image",
                  image_url: selfieDataUrl
                }
              ]
            }
          ],
          tools: [{ type: "image_generation" }]
        });
        
        console.log('📊 Responses API response structure:', JSON.stringify(response, null, 2).substring(0, 1000));
        
        // Extract image from response output
        const imageData = response.output
          .filter((output) => output.type === "image_generation_call")
          .map((output) => output.result);

        if (imageData.length > 0) {
          const imageBase64 = imageData[0];
          console.log('✅ Image generated with photo, base64 length:', imageBase64?.length);
          
          // Format to match expected structure
          result = {
            data: [{ b64_json: imageBase64 }]
          };
        } else {
          console.log('📝 No image generated, response content:', response.output.map(o => o.content || o.type));
          throw new Error('No image generated from Responses API');
        }
        
      } else {
        // Use regular image generation for no photo
        console.log('🚀 Calling OpenAI image generation...');
        result = await openai.images.generate({
          model: "gpt-image-1",
          prompt: prompt,
          size: "1024x1024",
          n: 1
        });
      }
      
      console.log('✅ OpenAI success, image generated');
      console.log('📊 Result structure keys:', Object.keys(result));
      console.log('📊 Result data length:', result.data?.length);
      console.log('📊 Has b64_json:', !!result.data?.[0]?.b64_json);
      
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
