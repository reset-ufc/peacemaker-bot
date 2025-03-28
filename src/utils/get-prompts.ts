import promptsJson from '../../prompts/prompts.json';

export function getPrompts(language: string = 'en'): {
  classification: string;
  recommendation: string;
} {
  const promptsjson = promptsJson as Record<string, string>;
  const classificationKey = `prompt_classification_${language}`;
  const recommendationKey = `prompt_recommendation_${language}`;

  if (!promptsjson[classificationKey]) {
    throw new Error(`Language '${language}' not supported`);
  }

  if (!promptsjson[recommendationKey]) {
    throw new Error(`Language '${language}' not supported`);
  }

  return {
    classification: promptsjson[classificationKey].trim(),
    recommendation: promptsjson[recommendationKey].trim(),
  };
}
