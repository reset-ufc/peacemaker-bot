import mongoose, { Schema } from 'mongoose';

export interface SuggestionsDocument extends mongoose.Document {
  gh_comment_id: string; // id do comentário no GitHub
  suggestions: Array<{
    content: string; // solução sugerida
  }>; // sugestões do comentário
  is_edited: boolean; // se o comentário foi editado
  suggestion_selected_index: number | null; // index da sugestão selecionada
}

const SuggestionsSchema = new Schema<SuggestionsDocument>({
  gh_comment_id: { type: String, required: true, unique: true },
  suggestions: [{ content: { type: String, required: true } }],
  is_edited: { type: Boolean, required: true, default: false },
  suggestion_selected_index: { type: Number, required: false, default: null },
});

export const Suggestions = mongoose.model<SuggestionsDocument>(
  'Suggestions',
  SuggestionsSchema,
);
