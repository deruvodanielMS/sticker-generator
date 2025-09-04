import { buildPrompt } from '../utils/prompt';
import { svgDataUrl } from '../utils/canvas';
import type { Archetype, GenerationResult } from '../types';

const API_KEY = import.meta.env.VITE_API_KEY_IMAGE_GENERATION as string | undefined;

async function b64ToObjectUrl(b64: string, mime = 'image/png') {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: mime });
  return URL.createObjectURL(blob);
}

async function generateViaProxy(prompt: string, selfieDataUrl?: string): Promise<string> {
  const res = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, selfieDataUrl }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Proxy image generation error ${res.status} ${txt}`);
  }
  const json = await res.json();
  // openai returns data[0].b64_json
  const b64 = json?.data?.[0]?.b64_json || json?.data?.[0]?.b64_json;
  if (!b64) throw new Error('Proxy returned no image data');
  return await b64ToObjectUrl(b64);
}

// Generate sticker - accepts optional promptOverride from the LLM
export async function generateSticker(archetype: Archetype, selfieDataUrl?: string, promptOverride?: string): Promise<GenerationResult> {
  const includeSelfie = Boolean(selfieDataUrl);
  const prompt = promptOverride ?? buildPrompt(archetype, includeSelfie);
  const online = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (API_KEY && online) {
    try {
      const selfieBlob = selfieDataUrl ? await (await fetch(selfieDataUrl)).blob() : undefined;
      const url = await generateViaOpenAI(prompt, selfieBlob);
      return { imageUrl: url, archetype, prompt, source: 'openai' };
    } catch (e: any) {
      // fall through to local generation
      console.error('Image generation failed:', e);
      const errMsg = e?.message || String(e);
      const dataUrl = svgDataUrl(archetype, selfieDataUrl);
      return { imageUrl: dataUrl, archetype, prompt, source: 'fallback', providerError: errMsg };
    }
  }

  const dataUrl = svgDataUrl(archetype, selfieDataUrl);
  return { imageUrl: dataUrl, archetype, prompt, source: 'fallback' };
}
