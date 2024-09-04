const Probot = require("probot")
const detectToxicity = require("../detection/index")
const { getCommentClassification, getFriendlyComment } = require("../llm/index")
const reactToUserComment = require("../reaction/index")
const saveCommentRoute = process.env.SAVE_COMMENT_API_URL
const axios = require("axios")

module.exports = async function monitorComments(context) {
    try {
        // Get the comment body from the context payload
        const commentBody = context.payload.comment.body
        const toxicityScore = await detectToxicity(commentBody)
        console.log(`Toxicity score for comment: ${toxicityScore}`)

        if (toxicityScore > 0.5) {
            const friendlyCommentResponse = await getFriendlyComment(
                commentBody
            )
            const classificationResponse = await getCommentClassification(
                commentBody
            )
            const friendlyComment = JSON.parse(
                friendlyCommentResponse.choices[0].message.content
            ).corrected_comment
            const classification = JSON.parse(
                classificationResponse.choices[0].message.content
            ).incivility

            console.log(`Classification: ${classification}`)
            console.log(`Friendly comment: ${friendlyComment}`)

            await reactToUserComment(context, "confused")
            console.log("Toxic comment saved to database")
            // Requisiton to save the comment using the API

            const response = await axios.post(saveCommentRoute, {
                comment_id: context.payload.comment.id,
                id_user: context.payload.comment.user.id,
                id_repo: context.payload.repository.id,
                user_login: context.payload.comment.user.login,
                repo_full_name: context.payload.repository.full_name,
                created_at: context.payload.comment.created_at,
                comment: commentBody,
                classification: classification,
                toxicityScore,
                friendlyComment: friendlyComment,
                solved: false,
                solution: null // Fixed, ignored, or disputed
            })

            if (!response.status === 200) {
                console.error("Error saving comment via API:", response.status)
            }
            console.log("Toxic comment saved via API")
        }
    } catch (error) {
        console.error("Error processing comment:", error)
    }
}
