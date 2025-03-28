import { Document, Schema, model } from 'mongoose';

export enum CommentType {
  ISSUE = 'issue',
  PULL_REQUEST = 'pull_request',
}

export interface ParentDocument extends Document {
  comment_id: string;
  gh_parent_id: string;
  gh_parent_number: number;
  title: string;
  html_url: string;
  is_open: string;
  type: CommentType;
  created_at: Date;
}

const ParentSchema = new Schema<ParentDocument>({
  comment_id: { type: String, required: true },
  gh_parent_id: { type: String, required: true },
  gh_parent_number: { type: Number, required: true },
  title: { type: String, required: true },
  html_url: { type: String, required: true },
  is_open: { type: String, required: true },
  type: { type: String, enum: Object.values(CommentType), required: true },
  created_at: { type: Date, default: Date.now },
});

export const Parents = model<ParentDocument>('Parent', ParentSchema);
