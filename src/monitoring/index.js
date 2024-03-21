const Probot = require("probot")
const detectToxicity = require("../detection")
const { client } = require("../mongo/connection")

module.exports = async function monitorComments(context) {
    try {
        await client.connect()
        const commentBody = context.payload.comment.body
        const toxicityScore = await detectToxicity(commentBody)

        if (toxicityScore > 0.7) {
            const db = client.db("toxicComments")
            const collection = db.collection("comments")
            await collection.insertOne({ comment: commentBody, toxicityScore })
        }
    } catch (error) {
        console.error("Error processing comment:", error)
    } finally {
        await client.close()
    }
}
