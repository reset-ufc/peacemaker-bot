import mongoose, { Schema } from 'mongoose';

export interface SuggestionsDocument extends mongoose.Document {
  gh_comment_id: string; // id do comentário no GitHub
  suggestions: Array<{
    content: string; // solução sugerida
  }>; // sugestões do comentário
  is_edited: boolean; // se o comentário foi editado
}

const SuggestionsSchema = new Schema<SuggestionsDocument>({
  gh_comment_id: { type: String, required: true, unique: true },
  suggestions: [{ content: { type: String, required: true } }],
  is_edited: { type: Boolean, required: true, default: false },
});

export const Suggestions = mongoose.model<SuggestionsDocument>(
  'Suggestions',
  SuggestionsSchema,
);
