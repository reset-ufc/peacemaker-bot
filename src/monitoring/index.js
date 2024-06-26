const Probot = require("probot")
const detectToxicity = require("../detection/index")
const getFriendlyComment = require("../recommendation/index")
const reactToUserComment = require("../reaction/index")
const { client } = require("../mongo/connection")

module.exports = async function monitorComments(context) {
    try {
        await client.connect()
        const commentBody = context.payload.comment.body
        const toxicityScore = await detectToxicity(commentBody)
        console.log(`Toxicity score for comment: ${toxicityScore}`)

        if (toxicityScore > 0.7) {
            const db = client.db("toxicComments")
            const collection = db.collection("comments")
            const friendlyComment = await getFriendlyComment(commentBody)
            console.log(`Friendly comment: ${friendlyComment}`)
            await reactToUserComment(context, "confused")
            console.log("Toxic comment saved to database")
            await collection.insertOne({
                comment_id: context.payload.comment.id,
                id_user: context.payload.comment.user.id,
                id_repo: context.payload.repository.id,
                user_login: context.payload.comment.user.login,
                repo_full_name: context.payload.repository.full_name,
                comment: commentBody,
                toxicityScore,
                friendlyComment: friendlyComment
            })
        }
    } catch (error) {
        console.error("Error processing comment:", error)
    }
}
