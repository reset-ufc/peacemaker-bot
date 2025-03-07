import { createGroq } from '@ai-sdk/groq';
import { generateObject } from 'ai';
import { z } from 'zod';
import { getPrompts } from '../utils/prompts';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function generateClassification(
  content: string,
  language: 'en' | ('pt' & string) = 'en',
) {
  const prompt = getPrompts(language);

  const classification = await generateObject({
    model: groq('llama-3.3-70b-versatile'),
    schema: z.object({
      classification: z.string(),
    }),
    system: prompt.classification,
    prompt: content.trim(),
    temperature: 1,
  });

  return classification.object.classification;
}

export async function generateSuggestions(
  content: string,
  language: 'en' | ('pt' & string) = 'en',
) {
  const prompt = getPrompts(language);
  const suggestions = await generateObject({
    model: groq('llama-3.3-70b-versatile'),
    schema: z.object({
      suggestions: z.array(z.object({ content: z.string() })),
    }),
    system: prompt.recommendation,
    prompt: content.trim(),
    temperature: 1,
  });

  return suggestions.object.suggestions;
}

// async function main() {
//   const classification = await generateClassification(
//     "@1M0RR1V3L fuck you this bot don't run, any way bro, make the L!!! (again) Fuck our code",
//   );

//   const suggestions = await generateSuggestions(
//     "@1M0RR1V3L fuck you this bot don't run, any way bro, make the L!!! (again) Fuck our code",
//   );

//   console.log('classification:', JSON.stringify(classification, null, 2));

//   console.log('suggestions:', JSON.stringify(suggestions, null, 2));
// }

// main();
