const Groq = require("groq-sdk")
const fs = require("fs")
const path = require("path")

async function llmRequest(prompt, toxicComment) {
    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
    })

    try {
        // Fetch a friendly comment from the Groq API
        const llmResponse = groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: prompt
                },
                {
                    role: "user",
                    content: toxicComment
                }
            ],
            model: "llama3-70b-8192"
        })
        return llmResponse
    } catch (error) {
        console.error("Error fetching groq response:", error)
        throw error // Rethrow the error or handle it as needed
    }
}

function readPromptClassification() {
    const filePath = path.join(__dirname, "prompt-classification.json")
    const fileContent = fs.readFileSync(filePath, "utf-8")
    return JSON.parse(fileContent)
}

function readPromptRecommendation() {
    const filePath = path.join(__dirname, "prompt-recommendation.json")
    const fileContent = fs.readFileSync(filePath, "utf-8")
    return JSON.parse(fileContent)
}

module.exports = async function getCommentClassification(toxicComment) {
    try {
        // Classification prompt is taken from the llm/prompt-classification.json file
        const classificationPrompt = readPromptClassification()
        const classification = llmRequest(
            classificationPrompt.prompt,
            toxicComment
        )
        return classification
    } catch (error) {
        console.error("Error fetching classification:", error)
        throw error // Rethrow the error or handle it as needed
    }
}

module.exports = async function getFriendlyComment(toxicComment) {
    try {
        // Fetch a friendly comment from the Groq API
        const recommendationPrompt = readPromptRecommendation()
        const friendlyComment = llmRequest(
            recommendationPrompt.prompt,
            toxicComment
        )
        return friendlyComment
    } catch (error) {
        console.error("Error fetching friendly comment:", error)
        throw error // Rethrow the error or handle it as needed
    }
}
