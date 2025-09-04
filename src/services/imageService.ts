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

async function generateViaOpenAI(prompt: string, selfieBlob?: Blob): Promise<string> {
  if (!API_KEY) throw new Error('No API key for image generation available');

  if (selfieBlob) {
    // Use the OpenAI image edits endpoint with multipart/form-data
    const form = new FormData();
    form.append('image', selfieBlob, 'selfie.png');
    form.append('prompt', prompt);
    form.append('model', 'gpt-image-1');
    form.append('size', '1024x1024');

    const res = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      body: form,
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`OpenAI Images edit error ${res.status} ${txt}`);
    }

    const json = await res.json();
    const b64 = json?.data?.[0]?.b64_json;
    if (!b64) throw new Error('OpenAI returned no image data');
    return await b64ToObjectUrl(b64);
  }

  // No selfie: use the generations endpoint
  const body = {
    model: 'gpt-image-1',
    prompt,
    size: '1024x1024',
    n: 1,
  } as any;

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OpenAI Images generation error ${res.status} ${txt}`);
  }

  const json = await res.json();
  const b64 = json?.data?.[0]?.b64_json;
  if (!b64) throw new Error('OpenAI returned no image data');
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
      return { imageUrl: url, archetype, prompt };
    } catch (e) {
      // fall through to local generation
      console.error('Image generation failed:', e);
    }
  }

  const dataUrl = svgDataUrl(archetype, selfieDataUrl);
  return { imageUrl: dataUrl, archetype, prompt };
}
