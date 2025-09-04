import type { Archetype } from '../types';

export function buildPrompt(archetype: Archetype, includeSelfie: boolean): string {
  const base = `A high-quality, circular sticker design in a ${archetype.colorPalette} theme. The background should be ${archetype.backgroundStyle}. The central subject is a robot character of type ${archetype.robotType}, with a ${archetype.robotPose}. The style is futuristic and human-centered. Text on the sticker: '${archetype.name}'.`;
  const selfie = includeSelfie
    ? " The robot has personal features from the user's selfie, like glasses or a hairstyle, subtly integrated in a respectful way."
    : '';
  return base + selfie;
}
