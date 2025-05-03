import { createGroq } from '@ai-sdk/groq';
import { createOpenAI } from '@ai-sdk/openai';
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
    return createOpenAI({apiKey: openai_key})(model);
  }
  throw new Error(`Unsupported model provider for model: ${model}`);
}

export async function generateClassification(
  content: string,
  language: string = 'en',
  model: Model = Model.LLAMA_3_3_70B_VERSATILE,
  groq_key: string,
  openai_key: string,
) {
  const prompt = getPrompts(language);

  const classification = await generateObject({
    model: resolveModel(model, groq_key, openai_key),
    schema: z.object({
      // classification: z
      //   .object({ incivility: z.string() })
      //   .optional(),
      incivility: z.string().optional(),
    }),
    system: prompt.classification,
    prompt: content.trim(),
    temperature: 1,
  });
  return classification.object.incivility;
}

export async function generateSuggestions(
  content: string,
  language: string = 'en',
  model: Model = Model.LLAMA_3_3_70B_VERSATILE,
  groq_key: string,
  openai_key: string,
): Promise<Array<{ corrected_comment: string }>> {
  const prompt = getPrompts(language);

  const suggestions = await generateObject({
    model: resolveModel(model, groq_key, openai_key),
    schema: z.object({
      suggestions: z.array(z.object({ corrected_comment: z.string() })),
    }),
    system: prompt.recommendation,
    prompt: content.trim(),
    temperature: 0.3,
  });

  return suggestions.object.suggestions;
}

export async function safeGenerateSuggestions(
  text: string,
  language: string,
  llmModel: Model,
  groqKey: string,
  openaiKey: string,
  analyzeToxicity: (s: string) => Promise<any>,
  context: any,
  threshold = 0.6
): Promise<{ corrected_comment: string }[]> {
  const maxAttempts = 3;
  let lastBatch: { corrected_comment: string }[] = [];

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    context.log.info(`safeGenerate: attempt ${attempt}…`);

    const suggestions = await generateSuggestions(
      text,
      language,
      llmModel,
      groqKey,
      openaiKey
    );
    lastBatch = suggestions;

    let allSafe = true;

    for (const s of suggestions) {
      let resp;
      try {
        resp = await analyzeToxicity(s.corrected_comment.trim());
      } catch (err) {
        context.log.error("safeGenerate: analyzeToxicity threw", err);
        allSafe = false;
        break;
      }

      const pov = resp?.data;
      if (
        !pov ||
        !pov.attributeScores ||
        !pov.attributeScores.TOXICITY ||
        typeof pov.attributeScores.TOXICITY.summaryScore?.value !== "number"
      ) {
        context.log.error("safeGenerate: missing attributeScores in", pov);
        allSafe = false;
        break;
      }

      const score = pov.attributeScores.TOXICITY.summaryScore.value;
      if (score >= threshold) {
        context.log.info(`safeGenerate: suggestion too toxic (${score}), retrying…`);
        allSafe = false;
        break;
      }
    }

    if (allSafe) {
      context.log.info("safeGenerate: all suggestions are under threshold — returning");
      return suggestions;
    }
  }

  context.log.warn(
    `safeGenerate: exhausted ${maxAttempts} attempts, returning last batch`
  );
  return lastBatch;
}
