import { buildPrompt as buildPromptUtil } from '../utils/prompt';
import type { Archetype, GenerationResult } from '../types';

async function b64ToObjectUrl(b64: string, mime = 'image/png') {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: mime });
  return URL.createObjectURL(blob);
}

async function dataUrlToBlob(dataUrl: string) {
  const res = await fetch(dataUrl);
  return await res.blob();
}

// Try requesting generation from server-side endpoint first (more reliable)
async function generateViaServer(prompt: string, selfieDataUrl?: string): Promise<string> {
  try {
    const resp = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, selfieDataUrl }),
    });

    const json = await resp.json();
    if (!resp.ok) {
      throw new Error(json?.error || json?.bodyText || 'Server generation failed');
    }

    const bodyJson = json?.bodyJson || json;
    const data = bodyJson?.data || bodyJson?.images || bodyJson;

    const b64 = data?.[0]?.b64_json || data?.[0]?.b64 || data?.[0]?.b64_json;
    const url = data?.[0]?.url || data?.[0]?.image_url || data?.[0]?.src;

    if (b64) return await b64ToObjectUrl(b64);
    if (url) return url;

    throw new Error('Server returned no image data');
  } catch (err: any) {
    throw new Error(`Server generation failed: ${err?.message || String(err)}`);
  }
}

// Call OpenAI REST API directly from the client (no backend). Expects VITE_OPENAI_API_KEY to be set.
async function generateViaOpenAI(prompt: string, selfieDataUrl?: string, photoStep?: string): Promise<string> {
  const key = (import.meta.env.VITE_OPENAI_API_KEY as string) || '';
  if (!key) throw new Error('No OpenAI key available in client environment (VITE_OPENAI_API_KEY).');

  // If selfie provided (or photoStep indicates sent), use image edits with gpt-image-1
  const useEdit = Boolean(selfieDataUrl) && photoStep !== 'skipped';

  if (useEdit && selfieDataUrl) {
    // prepare personalized prompt
    const personalizedPrompt = `${prompt}. Transform this into a square, full-bleed 1:1 sticker design (sized for 2x2 inches). Do NOT include rounded corners or any circular masking — produce a full-bleed square image that fills the canvas, with no text and no external borders. Keep the person's recognizable features integrated respectfully.`;

    const blob = await dataUrlToBlob(selfieDataUrl);
    const fd = new FormData();
    // The images edit endpoint expects one or more files under the key 'image[]' in some implementations.
    // We'll append as 'image' which the OpenAI images/edits endpoint also accepts.
    // Use image[] key for edits and set necessary params
    fd.append('image', blob, 'selfie.png');
    fd.append('model', 'gpt-image-1');
    fd.append('prompt', personalizedPrompt);
    fd.append('size', '1024x1024');
    fd.append('n', '1');

    const resp = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        // Note: DO NOT set Content-Type header when sending FormData in browser
      },
      body: fd,
    });

    const text = await resp.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch (e) {
      throw new Error(`Failed to parse OpenAI images.edit response: ${String(e)} — ${text.substring(0, 300)}`);
    }

    if (!resp.ok) {
      const errMsg = json?.error?.message || JSON.stringify(json);
      throw new Error(`OpenAI images.edit error: ${errMsg}`);
    }

    const b64 = json?.data?.[0]?.b64_json;
    const url = json?.data?.[0]?.url;
    if (b64) return await b64ToObjectUrl(b64);
    if (url) return url;

    throw new Error(`OpenAI images.edit returned no image data. Response: ${JSON.stringify(json)}`);
  }

  // Otherwise generate from text using dall-e-3
  const payload = {
    model: 'dall-e-3',
    prompt,
    size: '1024x1024',
    n: 1,
    response_format: 'b64_json',
  };

  const genResp = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const genText = await genResp.text();
  let genJson: any = null;
  try {
    genJson = JSON.parse(genText);
  } catch (e) {
    throw new Error(`Failed to parse OpenAI images.generate response: ${String(e)} — ${genText.substring(0, 300)}`);
  }

  if (!genResp.ok) {
    const errMsg = genJson?.error?.message || JSON.stringify(genJson);
    throw new Error(`OpenAI images.generate error: ${errMsg}`);
  }

  const b64 = genJson?.data?.[0]?.b64_json;
  const url = genJson?.data?.[0]?.url;
  if (b64) return await b64ToObjectUrl(b64);
  if (url) return url;

  throw new Error(`OpenAI images.generate returned no image data. Response: ${JSON.stringify(genJson)}`);
}

// Generate sticker - accepts optional promptOverride from the LLM
export async function generateSticker(archetype: Archetype, selfieDataUrl?: string, promptOverride?: string, photoStepParam?: string): Promise<GenerationResult> {
  const includeSelfie = Boolean(selfieDataUrl);
  const prompt = promptOverride ?? buildPromptUtil(archetype, includeSelfie);
  const photoStep = photoStepParam ?? (selfieDataUrl ? 'sent' : 'skipped');
  const online = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (online) {
    // Prefer server-side generation to avoid client-side CORS and key issues
    try {
      const url = await generateViaServer(prompt, selfieDataUrl);
      return { imageUrl: url, archetype, prompt, source: 'server' };
    } catch (serverErr: any) {
      // If server fails, fall back to client-side direct OpenAI call
      try {
        const url = await generateViaOpenAI(prompt, selfieDataUrl, photoStep);
        return { imageUrl: url, archetype, prompt, source: 'openai' };
      } catch (clientErr: any) {
        const errMsg = clientErr?.message || serverErr?.message || String(clientErr || serverErr);
        const dataUrl = svgDataUrl(archetype, selfieDataUrl);
        return { imageUrl: dataUrl, archetype, prompt, source: 'fallback', providerError: errMsg };
      }
    }
  }

  const dataUrl = svgDataUrl(archetype, selfieDataUrl);
  return { imageUrl: dataUrl, archetype, prompt, source: 'fallback' };
}

// Fallback: return a provided static image asset instead of SVG
function svgDataUrl(archetype: Archetype, selfieDataUrl?: string) {
  // Use the designer-provided rectangle image as a friendly fallback
  return 'https://cdn.builder.io/api/v1/image/assets%2Fae236f9110b842838463c282b8a0dfd9%2F8c6851ed424248ef976a48b883ae9729?format=webp&width=800';
}

function escapeXml(str: string) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}
