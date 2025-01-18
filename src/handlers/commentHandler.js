const config = require("../config")
const { detectToxicity } = require("../services/perspective")
const llmService = require("../services/llm")
const GitHubService = require("../services/github")
const DatabaseService = require("../services/database")

async function handleComment(context) {
    try {
        const comment = context.payload.comment.body
        const toxicityScore = await detectToxicity(comment)

        if (toxicityScore > config.TOXICITY_THRESHOLD) {
            const [classification, friendlyComment] = await Promise.all([
                llmService.getClassification(comment),
                llmService.getFriendlyComment(comment)
            ])

            await Promise.all([
                GitHubService.reactToComment(
                    context,
                    "eyes",
                    context.payload.comment.user.login
                ),
                DatabaseService.saveComment({
                    comment_id: context.payload.comment.id.toString(),
                    github_id: context.payload.comment.user.id.toString(),
                    repo_id: context.payload.repository.id.toString(),
                    login: context.payload.comment.user.login,
                    repo_full_name: context.payload.repository.full_name,
                    created_at: context.payload.comment.created_at,
                    comment,
                    classification: classification?.incivility,
                    toxicity_score: toxicityScore.toString(),
                    friendly_comment: friendlyComment?.corrected_comment,
                    solved: false,
                    solution: null
                })
            ])
        }
    } catch (error) {
        console.error("Comment handling error:", error)
    }
}

module.exports = handleComment