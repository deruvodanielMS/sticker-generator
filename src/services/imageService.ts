import { buildPrompt } from '../utils/prompt';
import { svgDataUrl } from '../utils/canvas';
import type { Archetype, GenerationResult } from '../types';

const API_KEY = import.meta.env.VITE_API_KEY_IMAGE_GENERATION as string | undefined;

async function generateViaStability(prompt: string, selfieBlob?: Blob): Promise<string> {
  const form = new FormData();
  form.append('prompt', prompt);
  form.append('output_format', 'png');
  if (selfieBlob) {
    // Many providers require a different endpoint for image-to-image; for simplicity we pass as reference
    form.append('image', selfieBlob, 'selfie.png');
  }

  const res = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      Accept: 'image/png',
    },
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Image API error ${res.status}`);
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

// Generate sticker - accepts optional promptOverride from the LLM
export async function generateSticker(archetype: Archetype, selfieDataUrl?: string, promptOverride?: string): Promise<GenerationResult> {
  const includeSelfie = Boolean(selfieDataUrl);
  const prompt = promptOverride ?? buildPrompt(archetype, includeSelfie);
  const online = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (API_KEY && online) {
    try {
      const selfieBlob = selfieDataUrl ? await (await fetch(selfieDataUrl)).blob() : undefined;
      const url = await generateViaStability(prompt, selfieBlob);
      return { imageUrl: url, archetype, prompt };
    } catch (e) {
      // fall through to local generation
    }
  }

  const dataUrl = svgDataUrl(archetype, selfieDataUrl);
  return { imageUrl: dataUrl, archetype, prompt };
}
