import { createGroq } from '@ai-sdk/groq';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

import { Model, ModelProvider, modelProviderMap } from '@/enums/models.js';
import { getPrompts } from '@/utils/get-prompts.js';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function resolveModel(model: Model) {
  const provider = modelProviderMap[model];
  if (provider === ModelProvider.GROQ) {
    return groq(model);
  }
  if (provider === ModelProvider.OPENAI) {
    return openai(model);
  }
  throw new Error(`Unsupported model provider for model: ${model}`);
}

export async function generateClassification(
  content: string,
  language: string = 'en',
  model: Model = Model.LLAMA_3_3_70B_VERSATILE,
) {
  const prompt = getPrompts(language);

  const classification = await generateObject({
    model: resolveModel(model),
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
): Promise<Array<{ corrected_comment: string }>> {
  const prompt = getPrompts(language);

  const suggestions = await generateObject({
    model: resolveModel(model),
    schema: z.object({
      suggestions: z.array(z.object({ corrected_comment: z.string() })),
    }),
    system: prompt.recommendation,
    prompt: content.trim(),
    temperature: 1,
  });

  return suggestions.object.suggestions;
}