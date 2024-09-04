const { google } = require("googleapis")
const DISCOVERY_URL = process.env.DISCOVERY_URL
const PERSPECTIVE_API_KEY = process.env.PERSPECTIVE_API_KEY

module.exports = async function detectToxicity(comment) {
    try {
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
            key: PERSPECTIVE_API_KEY,
            resource: analyzeRequest
        })

        if (
            !response.data ||
            !response.data.attributeScores ||
            !response.data.attributeScores.TOXICITY
        ) {
            throw new Error("Unable to get toxicity score")
        }
        return response.data.attributeScores.TOXICITY.summaryScore.value
    } catch (err) {
        console.error(err)
        throw err
    }
}
