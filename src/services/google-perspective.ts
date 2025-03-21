import { google } from 'googleapis';

import env from '@/env.js';
import { DiscoverAPIResponse } from '@/types/google-perspective-response.js';

export async function analyzeToxicity(
  text: string,
): Promise<DiscoverAPIResponse> {
  const client = await google.discoverAPI(env.DISCOVERY_URL);

  // @ts-ignore
  const response = await client.comments.analyze({
    key: env.PERSPECTIVE_API_KEY,
    resource: {
      comment: { text },
      requestedAttributes: { TOXICITY: {} },
    },
  });

  if (!response.data?.attributeScores?.TOXICITY) {
    throw new Error('Unable to get toxicity score');
  }

  return response as DiscoverAPIResponse;
}
