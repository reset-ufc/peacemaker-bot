const Probot = require("probot")
const detectToxicity = require("../detection/index")
const getFriendlyComment = require("../recommendation/index")
const getCommentClassification = require("../classification/index")
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
            const friendlyComment = await getFriendlyComment(commentBody)
            const classification = await getCommentClassification(commentBody)
            console.log(
                `Friendly comment: ${friendlyComment.choices[0].message.content}`
            )
            console.log(
                `Classification: ${classification.choices[0].message.content}`
            )
            await reactToUserComment(context, "confused")
            console.log("Toxic comment saved to database")
            await collection.insertOne({
                comment_id: context.payload.comment.id,
                id_user: context.payload.comment.user.id,
                id_repo: context.payload.repository.id,
                user_login: context.payload.comment.user.login,
                repo_full_name: context.payload.repository.full_name,
                comment: commentBody,
                classification: classification.choices[0].message.content,
                toxicityScore,
                friendlyComment: friendlyComment.choices[0].message.content
            })
        }
    } catch (error) {
        console.error("Error processing comment:", error)
    }
}
