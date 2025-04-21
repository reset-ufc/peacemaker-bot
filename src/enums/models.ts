export enum ModelProvider {
  GROQ = 'groq',
  OPENAI = 'openai',
}

export enum Model {
  // 🟠 Groq - Meta & Google
  LLAMA_3_3_70B_VERSATILE = 'llama-3.3-70b-versatile',
  LLAMA_3_1_8B_INSTANT = 'llama-3.1-8b-instant',
  LLAMA_GUARD_3_8B = 'llama-guard-3-8b',
  LLAMA_3_70B_8192 = 'llama3-70b-8192',
  LLAMA_3_8B_8192 = 'llama3-8b-8192',
  GEMMA2_9B_IT = 'gemma2-9b-it',

  // 🔵 OpenAI - GPTs
  GPT_4 = 'gpt-4',
  GPT_4_0613 = 'gpt-4-0613',
  GPT_4_1106_PREVIEW = 'gpt-4-1106-preview',
  GPT_4_TURBO = 'gpt-4-turbo',
  GPT_4_TURBO_2024_04_09 = 'gpt-4-turbo-2024-04-09',
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
  GPT_3_5_TURBO_16K = 'gpt-3.5-turbo-16k',
  GPT_3_5_TURBO_0613 = 'gpt-3.5-turbo-0613',
  GPT_3_5_TURBO_1106 = 'gpt-3.5-turbo-1106',
  GPT_3_5_TURBO_0125 = 'gpt-3.5-turbo-0125',
}

// 🔁 Mapeamento de provedor
export const modelProviderMap: Record<Model, ModelProvider> = {
  [Model.LLAMA_3_3_70B_VERSATILE]: ModelProvider.GROQ,
  [Model.LLAMA_3_1_8B_INSTANT]: ModelProvider.GROQ,
  [Model.LLAMA_GUARD_3_8B]: ModelProvider.GROQ,
  [Model.LLAMA_3_70B_8192]: ModelProvider.GROQ,
  [Model.LLAMA_3_8B_8192]: ModelProvider.GROQ,
  [Model.GEMMA2_9B_IT]: ModelProvider.GROQ,
  [Model.GPT_4]: ModelProvider.OPENAI,
  [Model.GPT_4_0613]: ModelProvider.OPENAI,
  [Model.GPT_4_1106_PREVIEW]: ModelProvider.OPENAI,
  [Model.GPT_4_TURBO]: ModelProvider.OPENAI,
  [Model.GPT_4_TURBO_2024_04_09]: ModelProvider.OPENAI,
  [Model.GPT_3_5_TURBO]: ModelProvider.OPENAI,
  [Model.GPT_3_5_TURBO_16K]: ModelProvider.OPENAI,
  [Model.GPT_3_5_TURBO_0613]: ModelProvider.OPENAI,
  [Model.GPT_3_5_TURBO_1106]: ModelProvider.OPENAI,
  [Model.GPT_3_5_TURBO_0125]: ModelProvider.OPENAI,
}

// 🔠 Limite de contexto
export const contextWindowMap: Partial<Record<Model, number>> = {
  [Model.LLAMA_3_3_70B_VERSATILE]: 128_000,
  [Model.LLAMA_3_1_8B_INSTANT]: 128_000,
  [Model.LLAMA_GUARD_3_8B]: 8_192,
  [Model.LLAMA_3_70B_8192]: 8_192,
  [Model.LLAMA_3_8B_8192]: 8_192,
  [Model.GEMMA2_9B_IT]: 8_192,
}

// 🔢 Limite de tokens de geração
export const maxCompletionTokensMap: Partial<Record<Model, number>> = {
  [Model.LLAMA_3_3_70B_VERSATILE]: 32_768,
  [Model.LLAMA_3_1_8B_INSTANT]: 8_192,
}

export const getModelEnum = (value: string): Model | undefined => {
  return Object.values(Model).includes(value as Model) ? (value as Model) : undefined;
};