import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // dev server middleware to proxy image requests to OpenAI securely
  // Note: Simple proxy for image generation (no multipart selfie support in this middleware).
  configureServer: (server: any) => {
    server.middlewares.use('/api/generate-image', async (req: any, res: any, next: any) => {
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
          // For now, we don't support image edits via this simple proxy. Proceed without selfie.
          console.warn('Selfie provided but will be ignored by proxy.');
        }

        // no selfie: image generation
        // @ts-ignore - fetch available in Node 18+ runtime
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
