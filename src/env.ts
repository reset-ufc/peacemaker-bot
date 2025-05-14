import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
    .default('info'),
  WEBHOOK_PROXY_URL: z.string().url(),
  APP_ID: z.string(),
  WEBHOOK_SECRET: z.string(),
  PRIVATE_KEY: z.string(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  PERSPECTIVE_API_KEY: z.string(),
  DISCOVERY_URL: z
    .string()
    .url()
    .default(
      'https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1',
    ),
  MONGODB_URI: z.string().url(),
  PORT: z.coerce.number(),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error(env.error.message);
  process.exit(1);
}

export default env.data;
