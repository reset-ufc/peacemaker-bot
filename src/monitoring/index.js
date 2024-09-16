const Probot = require("probot")
const detectToxicity = require("../detection/index")
const { getCommentClassification, getFriendlyComment } = require("../llm/index")
const reactToUserComment = require("../reaction/index")
const { client } = require("../mongo/connection")

module.exports = async function monitorComments(context) {
    try {
        // Connect to the MongoDB database
        await client.connect()  
        const db = client.db("PeaceMaker")
        const collection = db.collection("comments")

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
                    .replace(/[\u2018\u2019]/g, "'")
                    .replace(/[\u201c\u201d]/g, '"')
            )
            const classification = JSON.parse(
                classificationResponse.choices[0].message.content
                    .replace(/[\u2018\u2019]/g, "'")
                    .replace(/[\u201c\u201d]/g, '"')
            )

            console.log(`Classification: ${classification}`)
            console.log(`Friendly comment: ${friendlyComment}`)

            await reactToUserComment(context, "eyes")
            console.log("Toxic comment saved to database")
            // Requisiton to save the comment using the API

            await collection.insertOne({
                comment_id: context.payload.comment.id.toString(),
                id_user: context.payload.comment.user.id.toString(),
                id_repo: context.payload.repository.id.toString(),
                user_login: context.payload.comment.user.login,
                repo_full_name: context.payload.repository.full_name,
                created_at: context.payload.comment.created_at,
                comment: commentBody,
                classification: classification.incivility,
                toxicityScore: toxicityScore.toString(),
                friendlyComment: friendlyComment.corrected_comment,
                solved: false,
                solution: null // Fixed, ignored, or disputed
            })

            console.log("Toxic comment saved")
        }
    } catch (error) {
        console.error("Error processing comment:", error)
    }
}
