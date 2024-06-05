const axios = require("axios")
const Groq = require("groq-sdk")

module.exports = async function getFriendlyComment(toxicComment) {
    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
    })

    const prompt = {
        messages: []
    }

    try {
        // Fetch a friendly comment from the Groq API
        const llmResponse = groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content:
                        "Rewrite the following toxic input into non-toxic version. You should first think about the expanation of why the input text is toxic. Then generate the detoxic output. You must preserve the original meaning as much as possible."
                },
                {
                    role: "user",
                    content: toxicComment
                }
            ],
            model: "llama3-70b-8192"
        })

        // Assuming the response structure is similar to the curl command's expected output
        return llmResponse
    } catch (error) {
        console.error("Error fetching friendly comment:", error)
        throw error // Rethrow the error or handle it as needed
    }
}
