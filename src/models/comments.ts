import { Document, Schema, model } from 'mongoose';

export interface CommentsDocument extends Document {
  gh_comment_id: string;
  gh_repository_id: string;
  gh_repository_name: string;
  gh_repository_owner: string;
  gh_comment_sender_id: string;
  gh_comment_sender_login: string;
  content: string;
  event_type: string;
  toxicity_score: number;
  classification: string;
  solutioned: boolean;
  suggestion_id: string;
  comment_html_url: string;
  issue_id: string;
  bot_comment_id?: string;
  editAttempts: { type: Number, default: 0 },
  needsAttention: { type: Boolean, default: false },
  created_at: Date;
}

const CommentsSchema = new Schema<CommentsDocument>({
  gh_comment_id: { type: String, required: true },
  gh_repository_id: { type: String, required: true },
  gh_repository_name: { type: String, required: true },
  gh_repository_owner: { type: String, required: true },
  gh_comment_sender_id: { type: String, required: true },
  gh_comment_sender_login: { type: String, required: true },
  content: { type: String, required: true },
  event_type: { type: String, required: true },
  toxicity_score: { type: Number, required: true },
  classification: { type: String, required: true },
  solutioned: { type: Boolean, required: true, default: false },
  suggestion_id: { type: String, required: false, default: null, sparse: true },
  comment_html_url: { type: String, required: true },
  issue_id: { type: String, required: true },
  bot_comment_id: { type: String, required: false, default: null },
  created_at: { type: Date, default: Date.now },
});

export const Comments = model<CommentsDocument>('Comment', CommentsSchema);
