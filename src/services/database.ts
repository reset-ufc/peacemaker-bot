import mongoose, { Document, Schema } from 'mongoose';

import env from '@/env.js';

export const setupDatabase = async () => {
  await mongoose.connect(env.MONGODB_URI);
};

export interface UserDocument extends Document {
  gh_user_id: string;
  email?: string;
  name: string;
  username: string;
  avatar_url?: string;
  encrypted_token: string;
  llm_id: string;
  groq_api_key?: string;
  openai_api_key?: string;
  created_at: Date;
}

const UserSchema = new Schema<UserDocument>({
  gh_user_id: { type: String, required: true },
  email: { type: String },
  name: { type: String, required: true },
  username: { type: String, required: true },
  avatar_url: { type: String },
  encrypted_token: { type: String, required: true },
  llm_id: {
    type: String,
    required: true,
    default: 'LLAMA_3_3_70B_VERSATILE', // mesmo valor default do outro repo
  },
  groq_api_key: { type: String },
  openai_api_key: { type: String },
  created_at: { type: Date, required: true, default: Date.now },
});

export const UserModel = mongoose.model<UserDocument>('User', UserSchema);
