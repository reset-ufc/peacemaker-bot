import { Document, Schema, model } from 'mongoose';

export interface SuggestionsDocument extends Document {
  gh_comment_id: string;
  content: string;
  is_edited: boolean;
  is_rejected: boolean;
  created_at: Date;
}

const SuggestionsSchema = new Schema<SuggestionsDocument>({
  gh_comment_id: { type: String, required: true },
  content: { type: String, required: true },
  is_edited: { type: Boolean, required: true },
  is_rejected: { type: Boolean, required: true, default: false },
  created_at: { type: Date, default: Date.now },
});

export const Suggestions = model<SuggestionsDocument>(
  'Suggestion',
  SuggestionsSchema,
);
