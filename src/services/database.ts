import mongoose from 'mongoose';

import env from '@/env.js';

export const setupDatabase = async () => {
  await mongoose.connect(env.MONGODB_URI);
};
