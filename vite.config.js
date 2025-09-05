import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev middleware proxy for OpenAI image generation
export default defineConfig({
  plugins: [react()],
  configureServer(server) {
    server.middlewares.use('/api/generate-image', async (req, res, next) => {
      if (req.method !== 'POST') return next();
      try {
        let body = '';
        for await (const chunk of req) body += chunk;
        const data = JSON.parse(body || '{}');
        const { prompt, selfieDataUrl } = data;
        
        console.log('🔑 DEV: OPENAI_KEY present:', !!(process.env.VITE_API_KEY_IMAGE_GENERATION || process.env.OPENAI_API_KEY));
        console.log('📝 DEV: Prompt received:', prompt?.substring(0, 100) + '...');
        console.log('📸 DEV: Selfie provided:', !!selfieDataUrl);
        
        const OPENAI_KEY = process.env.VITE_API_KEY_IMAGE_GENERATION || process.env.OPENAI_API_KEY;
        
        if (!OPENAI_KEY) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ 
            status: 500,
            ok: false,
            bodyText: 'No server OpenAI key configured',
            bodyJson: null
          }));
          return;
        }

        if (!prompt) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ 
            status: 400,
            ok: false,
            bodyText: 'Missing prompt',
            bodyJson: null
          }));
          return;
        }

        // Call OpenAI Images generation endpoint
        const genRes = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${OPENAI_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            model: 'dall-e-2', 
            prompt, 
            size: '1024x1024', 
            n: 1, 
            response_format: 'b64_json' 
          }),
        });
        
        const respText = await genRes.text();
        console.log('🚀 DEV: OpenAI response status:', genRes.status);
        console.log('🚀 DEV: OpenAI response body (truncated):', respText.slice(0, 2000));
        
        let parsed = null;
        try {
          parsed = JSON.parse(respText);
        } catch (e) {
          parsed = null;
        }
        
        // Return envelope format that matches api/generate-image.js
        res.statusCode = genRes.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          status: genRes.status,
          ok: genRes.ok,
          bodyText: respText,
          bodyJson: parsed,
        }));
        
      } catch (err) {
        console.error('🔥 DEV: Error in generate-image middleware:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
          status: 500,
          ok: false,
          bodyText: String(err?.message || err),
          bodyJson: null
        }));
      }
    });

    // Add email middleware for development
    server.middlewares.use('/api/send-sticker-email', async (req, res, next) => {
      if (req.method !== 'POST') return next();
      res.statusCode = 501;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        error: 'Email sending not available in development. Configure SMTP env vars and deploy to test emails.' 
      }));
    });
  },
})
