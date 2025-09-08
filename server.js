import express from 'express';
import path from 'path';
import fs from 'fs';
import OpenAI, { toFile } from 'openai';

const app = express();
app.use(express.json({ limit: '30mb' }));

const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.VITE_API_KEY_IMAGE_GENERATION;
const openai = new OpenAI({ apiKey: OPENAI_KEY });



app.post('/api/generate-image', async (req, res) => {
  try {
    console.log('🔑 OPENAI_KEY present:', !!OPENAI_KEY);
    console.log('🔑 OPENAI_KEY first 10 chars:', OPENAI_KEY?.substring(0, 10));
    
    if (!OPENAI_KEY) return res.status(500).json({ error: 'Server missing OPENAI key' });
    
    const { prompt, selfieDataUrl, photoStep } = req.body || {};
    console.log('📝 Prompt received:', prompt?.substring(0, 100) + '...');
    console.log('📸 Selfie provided:', !!selfieDataUrl);
    console.log('🧭 photoStep:', photoStep);
    
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    try {
      let result;

      // Decide whether user skipped photo or provided one
      const skipped = (typeof photoStep === 'string' && photoStep === 'skipped') || !selfieDataUrl;

      if (!skipped && selfieDataUrl) {
        // Use real image with OpenAI images.edits via REST
        console.log('🚀 Using real image with OpenAI images.edits (REST)...');

        const match = selfieDataUrl.match(/^data:(.*);base64,(.*)$/);
        if (!match) {
          return res.status(400).json({ error: 'Invalid selfie data URL format' });
        }
        const mimeType = match[1];
        const base64Data = match[2];
        const imageBuffer = Buffer.from(base64Data, 'base64');

        console.log('📷 Image buffer size:', imageBuffer.length, 'bytes');

        // Use OpenAI client images.edit with toFile to pass the selfie buffer
        const imageFile = await toFile(imageBuffer, 'selfie.png', { type: mimeType || 'image/png' });
        console.log('Calling OpenAI images.edit with model gpt-image-1...');
        const editResult = await openai.images.edit({
          model: 'gpt-image-1',
          image: imageFile,
          prompt: `${prompt}. Transform this into a circular sticker design incorporating the person's appearance and features from the reference image. Make it creative and stylized while maintaining the person's recognizable characteristics. Do NOT include text, white borders, or rounded masks.`,
          size: '1024x1024',
          n: 1,
        });
        result = editResult;

      } else {
        // Use regular generation for no photo or when explicitly skipped
        console.log('🚀 Using regular image generation (gpt-image-1 via REST)...');

        console.log('Calling OpenAI images.generate with model gpt-image-1...');
        const genResult = await openai.images.generate({
          model: 'gpt-image-1',
          prompt,
          size: '1024x1024',
          n: 1,
        });
        result = genResult;
      }

      console.log('📊 Result structure keys:', Object.keys(result || {}));
      console.log('📊 Result data length:', (result?.data || result?.images || []).length);

      return res.status(200).json({ status: 200, ok: true, bodyText: JSON.stringify(result), bodyJson: result });
      
    } catch (openaiErr) {
      console.error('❌ OpenAI API error:', openaiErr);
      console.error('❌ Error details:', {
        message: openaiErr.message,
        status: openaiErr.status,
        code: openaiErr.code,
        type: openaiErr.type
      });
      
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
});


// Image proxy to convert external image URLs to data URLs to avoid CORS when composing canvas
app.post('/api/proxy-image', async (req, res) => {
  try {
    const { url } = req.body || {};
    if (!url) return res.status(400).json({ error: 'Missing url' });
    // Basic validation: only allow http/https
    if (!/^https?:\/\//i.test(url)) return res.status(400).json({ error: 'Invalid url' });

    const resp = await fetch(url);
    if (!resp.ok) return res.status(502).json({ error: 'Failed to fetch target image', status: resp.status });
    const buf = await resp.arrayBuffer();
    const contentType = resp.headers.get('content-type') || 'image/png';
    const b64 = Buffer.from(buf).toString('base64');
    const dataUrl = `data:${contentType};base64,${b64}`;
    return res.json({ dataUrl });
  } catch (err) {
    console.error('Proxy image error', err);
    return res.status(500).json({ error: String(err?.message || err) });
  }
});


// Serve static built site if present, otherwise fall back to project index.html (development)
const distPath = path.join(process.cwd(), 'dist');
const distIndex = path.join(distPath, 'index.html');
const rootIndex = path.join(process.cwd(), 'index.html');

if (fs.existsSync(distIndex)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => res.sendFile(distIndex));
} else if (fs.existsSync(rootIndex)) {
  // In dev mode serve the project index.html directly
  app.get('*', (req, res) => res.sendFile(rootIndex));
} else {
  // No index available
  app.get('*', (req, res) => res.status(404).send('Not Found'));
}

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`Server listening on ${port}`));
// Disable automatic timeouts so long-running provider requests can complete
if (server && typeof server.setTimeout === 'function') {
  server.setTimeout(0); // 0 = no timeout
  console.log('Server timeout disabled to allow long-running provider requests');
}
