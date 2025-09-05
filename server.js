import express from 'express';
import path from 'path';
import OpenAI from 'openai';
import nodemailer from 'nodemailer';

const app = express();
app.use(express.json({ limit: '10mb' }));

const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.VITE_API_KEY_IMAGE_GENERATION;
const openai = new OpenAI({
  apiKey: OPENAI_KEY,
});

// Email transporter configuration expects SMTP_* env vars
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER || 'no-reply@example.com';

app.post('/api/generate-image', async (req, res) => {
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
        // Use modern OpenAI API with photo input
        console.log('🚀 Calling OpenAI with photo using gpt-4.1...');

        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Generate a circular sticker image based on this prompt: ${prompt}. Use the person in the reference photo as inspiration for the character in the sticker. Make it creative and visually appealing.`
                },
                {
                  type: "image_url",
                  image_url: {
                    url: selfieDataUrl,
                    detail: "high"
                  }
                }
              ]
            }
          ],
          tools: [{ type: "dalle_3" }],
          tool_choice: { type: "dalle_3" }
        });

        console.log('📊 GPT-4o response:', JSON.stringify(response, null, 2).substring(0, 1000));

        // Extract image from tool calls
        const toolCall = response.choices[0]?.message?.tool_calls?.[0];
        if (toolCall && toolCall.function) {
          const imageData = JSON.parse(toolCall.function.arguments);
          result = {
            data: [{ b64_json: imageData.image || imageData.data }]
          };
        } else {
          throw new Error('No image generated from GPT-4o');
        }
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
      console.log('📊 Result structure:', JSON.stringify(result, null, 2).substring(0, 500));

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
});

// Email send endpoint: expects { to, subject, text, imageUrl }
app.post('/api/send-sticker-email', async (req, res) => {
  try {
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
      return res.status(500).json({ error: 'SMTP credentials not configured on server.' });
    }

    const { to, subject, text, imageUrl } = req.body || {};
    if (!to || !subject) return res.status(400).json({ error: 'Missing to or subject' });

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    // Retrieve image as buffer
    let attachment;
    if (imageUrl && imageUrl.startsWith('data:')) {
      // Data URL
      const match = imageUrl.match(/^data:(.*);base64,(.*)$/);
      if (match) {
        const mime = match[1];
        const data = Buffer.from(match[2], 'base64');
        attachment = { filename: 'sticker.png', content: data, contentType: mime };
      }
    } else if (imageUrl) {
      const resp = await fetch(imageUrl);
      const buf = await resp.arrayBuffer();
      const contentType = resp.headers.get('content-type') || 'image/png';
      attachment = { filename: 'sticker.png', content: Buffer.from(buf), contentType };
    }

    const mailOpts = {
      from: FROM_EMAIL,
      to,
      subject,
      text: text || '',
      attachments: attachment ? [attachment] : undefined,
    };

    await transporter.sendMail(mailOpts);
    return res.json({ success: true });
  } catch (err) {
    console.error('send email error', err);
    return res.status(500).json({ error: String(err?.message || err) });
  }
});

// Serve static built site
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`Server listening on ${port}`));
// Disable automatic timeouts so long-running provider requests can complete
if (server && typeof server.setTimeout === 'function') {
  server.setTimeout(0); // 0 = no timeout
  console.log('Server timeout disabled to allow long-running provider requests');
}
