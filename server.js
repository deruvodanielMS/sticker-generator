import express from 'express';
import path from 'path';
import fs from 'fs';
import FormData from 'form-data';

const app = express();
app.use(express.json({ limit: '10mb' }));

const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.VITE_API_KEY_IMAGE_GENERATION;



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

        const fd = new FormData();
        fd.append('image', imageBuffer, { filename: 'selfie.png', contentType: mimeType });
        fd.append('model', 'gpt-image-1');
        fd.append('prompt', `${prompt}. Transform this into a circular sticker design incorporating the person's appearance and features from the reference image. Make it creative and stylized while maintaining the person's recognizable characteristics. Do NOT include text or branding.`);
        fd.append('size', '1024x1024');
        fd.append('n', '1');

        const resp = await fetch('https://api.openai.com/v1/images/edits', {
          method: 'POST',
          headers: { Authorization: `Bearer ${OPENAI_KEY}`, ...fd.getHeaders() },
          body: fd,
        });
        const text = await resp.text();
        let json = null;
        try { json = JSON.parse(text); } catch (e) { return res.status(502).json({ error: 'Invalid JSON from OpenAI', bodyText: text }); }
        if (!resp.ok) return res.status(502).json({ error: json?.error?.message || JSON.stringify(json), bodyJson: json });
        result = json;

      } else {
        // Use regular generation for no photo or when explicitly skipped
        console.log('🚀 Using regular image generation (dall-e-3 via REST)...');

        const payload = { model: 'dall-e-3', prompt, size: '1024x1024', n: 1, response_format: 'b64_json' };
        const resp = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const text = await resp.text();
        let json = null;
        try { json = JSON.parse(text); } catch (e) { return res.status(502).json({ error: 'Invalid JSON from OpenAI', bodyText: text }); }
        if (!resp.ok) return res.status(502).json({ error: json?.error?.message || JSON.stringify(json), bodyJson: json });
        result = json;
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

// In development, attempt to spawn Vite dev server so preview works (only if not already running)
if (process.env.NODE_ENV !== 'production') {
  try {
    const { spawn } = await import('child_process');
    console.log('Starting Vite dev server as child process...');
    const viteProcess = spawn('npm', ['run', 'dev:vite'], { stdio: 'inherit', shell: true });
    viteProcess.on('error', (err) => console.warn('Failed to start Vite dev server:', err));
    viteProcess.on('exit', (code) => console.log('Vite dev server exited with code', code));
  } catch (e) {
    console.warn('Could not spawn Vite dev server:', e);
  }
}
