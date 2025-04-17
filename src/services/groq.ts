import { createGroq } from '@ai-sdk/groq';
import { generateObject } from 'ai';
import { z } from 'zod';

import { Model, ModelProvider, modelProviderMap } from '@/enums/models.js';
import { getPrompts } from '@/utils/get-prompts.js';

function resolveModel(model: Model, groq_key: string, openai_key: string) {
  const provider = modelProviderMap[model];
  if (provider === ModelProvider.GROQ) {
    return createGroq({apiKey: groq_key})(model);
  }
  if (provider === ModelProvider.OPENAI) {
    return createGroq({apiKey: openai_key, baseURL: 'https://api.groq.com/openai/v1'})(model);
  }
  throw new Error(`Unsupported model provider for model: ${model}`);
}

export async function generateClassification(
  content: string,
  language: string = 'en',
  model: Model = Model.LLAMA_3_3_70B_VERSATILE,
  groq_key: string = process.env.GROQ_API_KEY!,
  openai_key: string = process.env.OPENAI_API_KEY!,
) {
  const prompt = getPrompts(language);

  const classification = await generateObject({
    model: resolveModel(model, groq_key, openai_key),
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
  model: Model = Model.LLAMA_3_3_70B_VERSATILE,
  groq_key: string = process.env.GROQ_API_KEY!,
  openai_key: string = process.env.OPENAI_API_KEY!,
): Promise<Array<{ corrected_comment: string }>> {
  const prompt = getPrompts(language);

  const suggestions = await generateObject({
    model: resolveModel(model, groq_key, openai_key),
    schema: z.object({
      suggestions: z.array(z.object({ corrected_comment: z.string() })),
    }),
    system: prompt.recommendation,
    prompt: content.trim(),
    temperature: 1,
  });

  return suggestions.object.suggestions;
}