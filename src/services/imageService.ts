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

// Call OpenAI REST API directly from the client (no backend). Expects VITE_OPENAI_API_KEY to be set.
async function generateViaOpenAI(prompt: string, selfieDataUrl?: string, photoStep?: string): Promise<string> {
  const key = (import.meta.env.VITE_OPENAI_API_KEY as string) || '';
  if (!key) throw new Error('No OpenAI key available in client environment (VITE_OPENAI_API_KEY).');

  // If selfie provided (or photoStep indicates sent), use image edits with gpt-image-1
  const useEdit = Boolean(selfieDataUrl) && photoStep !== 'skipped';

  if (useEdit && selfieDataUrl) {
    // prepare personalized prompt
    const personalizedPrompt = `${prompt}. Transform this into a circular sticker design incorporating the person's appearance and features from the reference image. Make it creative and stylized while maintaining the person's recognizable characteristics.`;

    const blob = await dataUrlToBlob(selfieDataUrl);
    const fd = new FormData();
    // The images edit endpoint expects one or more files under the key 'image[]' in some implementations.
    // We'll append as 'image' which the OpenAI images/edits endpoint also accepts.
    fd.append('image', blob, 'selfie.png');
    fd.append('model', 'gpt-image-1');
    fd.append('prompt', personalizedPrompt);
    fd.append('size', '1024x1024');
    fd.append('n', '1');
    // Request base64 JSON so we can safely display in-browser
    fd.append('response_format', 'b64_json');

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
    try {
      const url = await generateViaOpenAI(prompt, selfieDataUrl, photoStep);
      return { imageUrl: url, archetype, prompt, source: 'openai' };
    } catch (e: any) {
      const errMsg = e?.message || String(e);
      // Fallback to simple SVG sticker so user always gets something
      const dataUrl = svgDataUrl(archetype, selfieDataUrl);
      return { imageUrl: dataUrl, archetype, prompt, source: 'fallback', providerError: errMsg };
    }
  }

  const dataUrl = svgDataUrl(archetype, selfieDataUrl);
  return { imageUrl: dataUrl, archetype, prompt, source: 'fallback' };
}

// Simple SVG fallback generator (keeps original behavior)
function svgDataUrl(archetype: Archetype, selfieDataUrl?: string) {
  const color = '#111827';
  const label = archetype?.label ?? 'Friend';
  const svg = `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1024\" height=\"1024\"><rect width=\"100%\" height=\"100%\" fill=\"#fff\"/><circle cx=\"512\" cy=\"384\" r=\"320\" fill=\"#f3f4f6\"/><text x=\"512\" y=\"620\" font-size=\"72\" font-family=\"Arial, Helvetica, sans-serif\" fill=\"${color}\" text-anchor=\"middle\">${escapeXml(label)}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeXml(str: string) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}
