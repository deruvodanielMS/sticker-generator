import type { Answers, Archetype } from '../types';

const API_KEY = import.meta.env.VITE_API_KEY_IMAGE_GENERATION as string | undefined;

async function callPaLM(promptText: string): Promise<string> {
  if (!API_KEY) throw new Error('No API key for LLM available');
  const url = `https://generativeai.googleapis.com/v1/models/text-bison-001:generateText?key=${API_KEY}`;
  const body = {
    prompt: { text: promptText },
    temperature: 0.7,
    maxOutputTokens: 800,
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`LLM error ${res.status} ${txt}`);
  }
  const data = await res.json();
  const content = data?.candidates?.[0]?.content;
  if (!content) throw new Error('LLM returned no content');
  return content;
}

function safeParseJsonFromString(s: string) {
  try {
    return JSON.parse(s);
  } catch (e) {
    // try to extract the first JSON object substring
    const match = s.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {}
    }
    throw new Error('Failed to parse JSON from LLM output');
  }
}

export async function generateArchetypeWithLLM(answers: Answers): Promise<{ archetype: Archetype; prompt: string }> {
  const lines = Object.entries(answers).map(([k, v]) => `- ${k}: ${v}`).join('\n');
  const instruction = `You are an assistant that maps a user's short answers into a creative AI archetype and a detailed image generation prompt for a circular sticker.

Be creative and vary outputs: even with similar inputs, return varied phrasing, color combinations, and micro-style hints. Add subtle variation so the resulting images can differ across requests.

User answers:
${lines}

Return a JSON object ONLY with the following fields:
- name (string): short archetype name (e.g., "Trailblazer")
- descriptor (string): one-sentence descriptor
- valueLine (string): a short value/benefit line
- backgroundStyle (string): short description of background style
- robotType (string): short description of the robot character
- robotPose (string): short description of the robot pose
- colorPalette (string): color palette description
- prompt (string): final single prompt to send to an image generation API. The prompt should be concise and include the above visual details and that the output is a high-quality circular sticker design. Use neutral respectful wording regarding user's photo; do not include personal identifiable requests.

Example output (JSON):
{
  "name": "Trailblazer",
  "descriptor": "You challenge the status quo and architect bold futures.",
  "valueLine": "You ignite industry shifts with decisive, high-impact moves.",
  "backgroundStyle": "neon gradient with subtle circuit patterns",
  "robotType": "sleek explorer android",
  "robotPose": "dynamic forward-leaning stance",
  "colorPalette": "electric blue, vibrant violet, and white",
  "prompt": "A high-quality, circular sticker design in electric blue and vibrant violet. The background should be a neon gradient with subtle circuit patterns. The central subject is a sleek explorer android in a dynamic forward-leaning stance. The style is futuristic, human-centered and friendly. Text on the sticker: 'Trailblazer'."
}

Do not include any additional text outside the JSON object.`;

  const output = await callPaLM(instruction);
  const json = safeParseJsonFromString(output);

  // Validate minimal fields
  const required = ['name', 'descriptor', 'valueLine', 'backgroundStyle', 'robotType', 'robotPose', 'colorPalette', 'prompt'];
  for (const r of required) {
    if (!(r in json)) throw new Error(`LLM output missing field ${r}`);
  }

  const archetype: Archetype = {
    name: String(json.name),
    descriptor: String(json.descriptor),
    valueLine: String(json.valueLine),
    backgroundStyle: String(json.backgroundStyle),
    robotType: String(json.robotType),
    robotPose: String(json.robotPose),
    colorPalette: String(json.colorPalette),
  };

  return { archetype, prompt: String(json.prompt) };
}
