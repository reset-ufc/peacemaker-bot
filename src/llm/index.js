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
    }
}

function readPrompts() {
    const filePath = path.join(__dirname, "prompts.json")
    const fileContent = fs.readFileSync(filePath, "utf-8")
    return JSON.parse(fileContent)
}

async function getCommentClassification(toxicComment) {
    try {
        // Classification prompt is taken from the llm/prompt-classification.json file
        const classificationPrompt = readPrompts()
        const classification = llmRequest(
            classificationPrompt.prompt_classification,
            toxicComment
        )
        return classification
    } catch (error) {
        console.error("Error fetching classification:", error)
    }
}

async function getFriendlyComment(toxicComment) {
    try {
        // Fetch a friendly comment from the Groq API
        const recommendationPrompt = readPrompts()
        const friendlyComment = llmRequest(
            recommendationPrompt.prompt_recommendation,
            toxicComment
        )
        return friendlyComment
    } catch (error) {
        console.error("Error fetching friendly comment:", error)
    }
}

module.exports = {
    getCommentClassification,
    getFriendlyComment
}
