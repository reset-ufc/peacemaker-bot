const Probot = require("probot");
const detectToxicity = require("../detection/index");
const { getCommentClassification, getFriendlyComment } = require("../llm/index");
const reactToUserComment = require("../reaction/index");
const axios = require("axios");

module.exports = async function monitorComments(context) {
    try {
        
        // Get the comment body from the context payload
        const commentBody = context.payload.comment.body;
        const perspectiveResponse = await detectToxicity(commentBody);
        const toxicityScore = JSON.parse(
            perspectiveResponse.attributeScores.TOXICITY.summaryScore.value
        );
        const languageResponse = perspectiveResponse.languages[0];
        console.log(`Response API: ${JSON.stringify(perspectiveResponse)}`);
        console.log(`Toxicity score for comment: ${toxicityScore}`);

        // if (toxicityScore > 0.1) {
        const friendlyCommentResponse = await getFriendlyComment(
            commentBody,
            languageResponse
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

        console.log(`Classification: ${JSON.stringify(classification)}`)
        console.log(`Friendly comment: ${JSON.stringify(friendlyComment)}`)

        await reactToUserComment(context, "eyes")
        console.log("Toxic comment saved to database")

        const commentData = {
            comment_id: context.payload.comment.id.toString(),
            github_id: context.payload.comment.user.id.toString(),
            repo_id: context.payload.repository.id.toString(),
            login: context.payload.comment.user.login,
            repo_full_name: context.payload.repository.full_name,
            comment: commentBody,
            classification: classification.incivility,
            toxicity_score: toxicityScore.toString(),
            friendly_comment: friendlyComment.corrected_comment,
            solved: false,
            solution: null // Fixed, ignored, or disputed
        };

        const apiResponse = await axios.post("http://localhost:3000/gh-comments", commentData, {
            headers: {
                "Content-Type": "application/json"
                }
        });

        console.log("Comment successfully sent to the API:", apiResponse.data);        
    } catch (error) {
        console.error("Error processing comment:", error)
    }
}
