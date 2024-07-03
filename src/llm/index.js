const axios = require("axios")
const Groq = require("groq-sdk")

module.exports = async function llmRequest(prompt, toxicComment) {
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
