const { google } = require("googleapis")
const DISCOVERY_URL = process.env.DISCOVERY_URL
const API_KEY = process.env.API_KEY

module.exports = async function detectToxicity(comment) {
    google
        .discoverAPI(DISCOVERY_URL)
        .then((client) => {
            const analyzeRequest = {
                comment: {
                    text: comment
                },
                requestedAttributes: {
                    TOXICITY: {}
                }
            }

            client.comments.analyze(
                {
                    key: API_KEY,
                    resource: analyzeRequest
                },
                (err, response) => {
                    if (err) throw err
                    console.log(JSON.stringify(response.data, null, 2))
                }
            )
        })
        .catch((err) => {
            throw err
        })
}

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
            key: API_KEY,
            resource: analyzeRequest
        })

        if (
            response.data &&
            response.data.attributeScores &&
            response.data.attributeScores.TOXICITY
        ) {
            return response.data.attributeScores.TOXICITY.summaryScore.value
        } else {
            throw new Error("Unable to get toxicity score")
        }
    } catch (err) {
        console.error(err)
        throw err
    }
}
