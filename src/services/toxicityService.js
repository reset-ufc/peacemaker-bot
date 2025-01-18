const { google } = require('googleapis');
const { DISCOVERY_URL, PERSPECTIVE_API_KEY } = require('../config/constants');

async function detectToxicity(comment) {
  try {
    const client = await google.discoverAPI(DISCOVERY_URL);
    const analyzeRequest = {
      comment: { text: comment },
      requestedAttributes: { TOXICITY: {} },
    };

    const response = await client.comments.analyze({
      key: PERSPECTIVE_API_KEY,
      resource: analyzeRequest,
    });

    if (!response.data?.attributeScores?.TOXICITY) {
      throw new Error('Unable to get toxicity score');
    }

    return response.data;
  } catch (error) {
    console.error('Toxicity detection error:', error);
    throw error;
  }
}

module.exports = { detectToxicity };
