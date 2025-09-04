import type { Archetype } from '../types';
import { QUESTIONS } from '../data/questions';
import type { Answers } from '../types';

export function buildPrompt(archetype: Archetype, includeSelfie: boolean): string {
  const base = `A high-quality, circular sticker design in a ${archetype.colorPalette} theme. The background should be ${archetype.backgroundStyle}. The central subject is a robot character of type ${archetype.robotType}, with a ${archetype.robotPose}. The style is futuristic and human-centered. Text on the sticker: '${archetype.name}'.`;
  const selfie = includeSelfie
    ? " The robot has personal features from the user's selfie, like glasses or a hairstyle, subtly integrated in a respectful way."
    : '';
  return base + selfie;
}

export function buildPromptFromAnswers(archetype: Archetype, answers: Answers, variant?: string): string {
  // Build human-readable answers summary
  const lines: string[] = [];
  for (const q of QUESTIONS) {
    const a = answers[q.id];
    if (a) {
      const opt = q.options.find(o => o.id === a.choice);
      const label = opt ? opt.label : String(a.choice);
      const intensity = a.intensity ? ` (intensity ${a.intensity}/10)` : '';
      lines.push(`${q.title}: ${label}${intensity}`);
    }
  }

  const vibe = variant ? ` Use style variant token: ${variant}.` : '';

  const prompt = `A high-quality, circular sticker design in a ${archetype.colorPalette} theme. The background should be ${archetype.backgroundStyle}. The central subject is a robot character of type ${archetype.robotType}, with a ${archetype.robotPose}. Style: futuristic, human-centered, tactile and friendly.${vibe} Based on the user's answers: ${lines.join('; ')}. Text on the sticker: '${archetype.name}'.`;
  return prompt;
}
