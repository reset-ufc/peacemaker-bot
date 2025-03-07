import mongoose from 'mongoose';
import { Comment } from '../models/comment.js';

export const setupDatabase = async () => {
  await mongoose.connect(process.env.MONGODB_DATABASE_URL!);

  // Verifica se o índice existe
  if (!Comment.schema.indexes().length) {
    await Comment.createIndexes();
  }
};
