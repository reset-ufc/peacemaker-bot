import { google } from 'googleapis';

// TODO: Não está mais funcionando
async function analyzeToxicity(text: string) {
  const DISCOVERY_URL = process.env.DISCOVERY_URL;
  const PERSPECTIVE_API_KEY = process.env.PERSPECTIVE_API_KEY;

  const client = await google.discoverAPI(DISCOVERY_URL!);

  // @ts-ignore
  const response = await client.comments.analyze({
    key: PERSPECTIVE_API_KEY,
    resource: {
      comment: { text },
      requestedAttributes: { TOXICITY: {} },
    },
  });

  if (!response.data?.attributeScores?.TOXICITY) {
    throw new Error('Unable to get toxicity score');
  }

  return {
    toxicityScore: response.data.attributeScores.TOXICITY.summaryScore.value,
    language: response.languages[0],
  };
}

export const mock_analyzeToxicity = async (
  text: string,
): Promise<{ toxicityScore: number; language: string }> => {
  console.log('MOCKING ANALYZE TOXICITY: ', text);
  return { toxicityScore: 0.4, language: 'en' };
};

analyzeToxicity(
  "@1M0RR1V3L fuck you this bot don't run, any way bro, make the L!!! (again) Fuck our code",
).then(response => {
  console.log('response', JSON.stringify({ response }, null, 2));
});
