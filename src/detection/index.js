const google = require("googleapis")
const DISCOVERY_URL = process.env.DISCOVERY_URL
const API_KEY = process.env.API_KEY

module.exports = async function detectToxicity(context) {
    const client = await google.discoverAPI(DISCOVERY_URL)
    const analyzeRequest = {
        comment: {
            text: comment
        },
        requestedAttributes: {
            TOXICITY: {}
        }
    }

    const response = await client.comments.analyze({
        key: API_KEY,
        resource: analyzeRequest
    })

    return response.data.attributeScores.TOXICITY.summaryScore.value
}
