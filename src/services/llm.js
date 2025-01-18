const Groq = require("groq-sdk")
const fs = require("fs")
const path = require("path")
const config = require("../config")

class LLMService {
    constructor() {
        this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
        this.prompts = this.loadPrompts()
    }

    loadPrompts() {
        const filePath = path.join(__dirname, "../prompts/prompts.json")
        return JSON.parse(fs.readFileSync(filePath, "utf-8"))
    }

    async processComment(prompt, comment) {
        try {
            const response = await this.groq.chat.completions.create({
                messages: [
                    { role: "system", content: prompt },
                    { role: "user", content: comment }
                ],
                model: config.GROQ_MODEL
            })
            return JSON.parse(response.choices[0].message.content
                .replace(/[\u2018\u2019]/g, "'")
                .replace(/[\u201c\u201d]/g, '"'))
        } catch (error) {
            console.error("LLM processing error:", error)
            return null
        }
    }

    async getClassification(comment) {
        return this.processComment(this.prompts.prompt_classification, comment)
    }

    async getFriendlyComment(comment) {
        return this.processComment(this.prompts.prompt_recommendation, comment)
    }
}

module.exports = new LLMService()