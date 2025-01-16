const { google } = require("googleapis");

async function detectToxicity(comment) {
  try {
    const client = await google.discoverAPI(process.env.DISCOVERY_URL);
    const response = await client.comments.analyze({
      key: process.env.PERSPECTIVE_API_KEY,
      resource: {
        comment: { text: comment },
        requestedAttributes: { TOXICITY: {} },
      },
    });

    return response.data?.attributeScores?.TOXICITY?.summaryScore?.value ?? 0;
  } catch (error) {
    console.error("Toxicity detection error:", error);
    return 0;
  }
}

module.exports = { detectToxicity };
