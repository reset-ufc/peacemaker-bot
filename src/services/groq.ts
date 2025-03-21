import { createGroq } from '@ai-sdk/groq';
import { generateObject } from 'ai';
import { z } from 'zod';

import { getPrompts } from '@/utils/get-prompts.js';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function generateClassification(
  content: string,
  language: string = 'en',
) {
  const prompt = getPrompts(language);

  const classification = await generateObject({
    model: groq('llama-3.3-70b-versatile'),
    schema: z.object({
      classification: z.object({
        incivility: z.string(),
      }),
    }),
    system: prompt.classification,
    prompt: content.trim(),
    temperature: 1,
  });

  return classification.object.classification;
}

export async function generateSuggestions(
  content: string,
  language: string = 'en',
): Promise<Array<{ corrected_comment: string }>> {
  const prompt = getPrompts(language);

  const suggestions = await generateObject({
    model: groq('llama-3.3-70b-versatile'),
    schema: z.object({
      suggestions: z.array(z.object({ corrected_comment: z.string() })),
    }),
    system: prompt.recommendation,
    prompt: content.trim(),
    temperature: 1,
  });

  return suggestions.object.suggestions;
}
