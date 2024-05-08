const axios = require("axios")
const OpenAI = require("openai")

module.exports = async function getFriendlyComment(toxicComment) {
    // Adjust the request body to match the curl command

    const prompt = {
        model: "tinyllama-chat",
        messages: [
            {
                role: "system",
                content:
                    "Rewrite the following toxic input into non-toxic version. You should first think about the expanation of why the input text is toxic. Then generate the detoxic output. You must preserve the original meaning as much as possible."
            },
            {
                role: "user",
                content: toxicComment,
                temperature: 0.5
            }
        ]
    }

    try {
        const gptResponse = await axios.post(
            process.env.LOCAL_AI_URL, // Use the LocalAI URL
            prompt,
            {
                headers: {
                    "Content-Type": "application/json", // Set the Content-Type header as per the curl command
                    Authorization: `Bearer ${process.env.LOCAL_AI_API_KEY}` // Use the LocalAI API key
                }
            }
        )

        // Assuming the response structure is similar to the curl command's expected output
        return gptResponse.data.choices[0].message.content
    } catch (error) {
        console.error("Error fetching friendly comment:", error)
        throw error // Rethrow the error or handle it as needed
    }
}
