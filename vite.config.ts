import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // dev server middleware to proxy image requests to OpenAI securely
  configureServer(server) {
    server.middlewares.use('/api/generate-image', async (req, res, next) => {
      if (req.method !== 'POST') return next();
      try {
        let body = '';
        for await (const chunk of req) body += chunk;
        const data = JSON.parse(body || '{}');
        const prompt = data.prompt;
        const selfieDataUrl = data.selfieDataUrl;
        const OPENAI_KEY = process.env.VITE_API_KEY_IMAGE_GENERATION || process.env.OPENAI_API_KEY;
        if (!OPENAI_KEY) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'No server OpenAI key configured' }));
          return;
        }

        if (selfieDataUrl) {
          // extract base64 part
          const match = selfieDataUrl.match(/data:(image\/[a-zA-Z+]+);base64,(.*)$/);
          if (!match) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid selfie data URL' }));
            return;
          }
          const mime = match[1];
          const b64 = match[2];
          // create blob from base64
          const buffer = Buffer.from(b64, 'base64');
          const blob = new Blob([buffer], { type: mime });
          const form = new FormData();
          form.append('image', blob, 'selfie.png');
          form.append('prompt', prompt);
          form.append('model', 'gpt-image-1');
          form.append('size', '1024x1024');

          const resp = await fetch('https://api.openai.com/v1/images/edits', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${OPENAI_KEY}`,
            },
            body: form as any,
          });

          const j = await resp.json();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(j));
          return;
        }

        // no selfie: image generation
        const genRes = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${OPENAI_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ model: 'gpt-image-1', prompt, size: '1024x1024', n: 1 }),
        });
        const json = await genRes.json();
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(json));
      } catch (err: any) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: String(err?.message || err) }));
      }
    });
  },
})
