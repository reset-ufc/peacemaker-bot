import axios from 'axios';

export type LLMModel = {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  context_window?: number;
  max_completion_tokens?: number;
};

export enum ModelProvider {
  GROQ = 'groq',
  OPENAI = 'openai',
}

const ensureContextWindow = (models: any[]): LLMModel[] => {
  return models.map(model => ({
    ...model,
    context_window: model.context_window ?? 6000,
    max_completion_tokens: model.max_completion_tokens ?? 6000,
  }));
};

export const fetchGroqModels = async (apiKey: string): Promise<LLMModel[]> => {
  try {
    const response = await axios.get('https://api.groq.com/openai/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const filteredModels = (response.data?.data || []).filter(
      (model: any) => model.active !== false
    );

    return ensureContextWindow(filteredModels);
  } catch (error) {
    console.error('Erro ao buscar modelos do Groq:', error);
    return [];
  }
};

export const fetchOpenAIModels = async (apiKey: string): Promise<LLMModel[]> => {
  try {
    const response = await axios.get('https://api.openai.com/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const data = (response.data?.data || []).map((model: any) => ({
      ...model,
      owned_by: 'openai',
    }));

    return ensureContextWindow(data);
  } catch (error) {
    console.error('Erro ao buscar modelos do OpenAI:', error);
    return [];
  }
};

export const getModelById = async (
  groqApiKey: string,
  openAiApiKey: string,
  modelId: string,
  fallbackId: string = 'llama-3.3-70b-versatile'
): Promise<LLMModel> => {
  const [groqModels, openAiModels] = await Promise.all([
    fetchGroqModels(groqApiKey),
    fetchOpenAIModels(openAiApiKey),
  ]);

  const allModels = [...groqModels, ...openAiModels];

  const selectedModel =
    allModels.find(m => m.id === modelId) ||
    allModels.find(m => m.id === fallbackId) ||
    allModels[0];

  if (!selectedModel) {
    throw new Error('[LLM] Nenhum modelo disponível foi encontrado.');
  }

  // Default context window, if not provided
  if (!selectedModel.context_window) {
    selectedModel.context_window = 6000;
  }

  if (selectedModel.id !== modelId) {
    console.warn(
      `[LLM] Modelo "${modelId}" não encontrado. Usando modelo alternativo "${selectedModel.id}".`
    );
  }

  return selectedModel;
};