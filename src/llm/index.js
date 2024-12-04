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
        const prompt = readPrompts()
        const classification = llmRequest(
            prompt.prompt_classification_en,
            toxicComment
        )
        return classification
    } catch (error) {
        console.error("Error fetching classification:", error)
    }
}

async function getFriendlyComment(toxicComment, language) {
    try {
        if (language === "pt") {
        const prompt = readPrompts()
        const friendlyComment = llmRequest(
            prompt.prompt_recommendation_pt,
            toxicComment
        )
        
        return friendlyComment
        } else if (language === "en") {
            const prompt = readPrompts()
            const friendlyComment = llmRequest(
                prompt.prompt_recommendation_en,
                toxicComment
            )
            return friendlyComment
        } else {
            throw new Error("Language not supported")
        }
    } catch (error) {
        console.error("Error fetching friendly comment:", error)
    }
}

module.exports = {
    getCommentClassification,
    getFriendlyComment
}
