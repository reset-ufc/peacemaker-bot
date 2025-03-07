import * as dotenv from 'dotenv';

dotenv.config();

const requiredEnv = ['GOOGLE_API_KEY', 'MONGODB_URI', 'GITHUB_APP_PEM'];

requiredEnv.forEach(key => {
  if (!process.env[key]) {
    throw new Error(`Missing required env variable: ${key}`);
  }
});
