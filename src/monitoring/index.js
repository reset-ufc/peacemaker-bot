const Probot = require("probot");
const detectToxicity = require("../detection/index");
const { getCommentClassification, getFriendlyComment } = require("../llm/index");
const reactToUserComment = require("../reaction/index");
const { client } = require("../mongo/connection");

const TOXICITY_THRESHOLD = 0.6;

module.exports = async function monitorComments(context) {
    try {
        
        await client.connect();
        const db = client.db(process.env.MONGODB_DB);
        const collection = db.collection("comments");

        // Validate payload
        const commentBody = context.payload?.comment?.body;
        if (!commentBody) {
            console.error("Missing comment body in payload");
            return;
        }

        // Detect toxicity
        let perspectiveResponse;
        try {
            perspectiveResponse = await detectToxicity(commentBody);
        } catch (err) {
            console.error("Error detecting toxicity:", err);
            return;
        }

        const toxicityScore = perspectiveResponse?.attributeScores?.TOXICITY?.summaryScore?.value || 0;
        const languageResponse = perspectiveResponse?.languages?.[0] || "en";
        console.log(`Toxicity score for comment: ${toxicityScore}`);

        let suggestions = {};

        if (toxicityScore >= TOXICITY_THRESHOLD) {
            console.log("Comment is toxic, generating suggestions...");
            try {
                const friendlyCommentResponse = await getFriendlyComment(commentBody, languageResponse);
                const classificationResponse = await getCommentClassification(commentBody);

                const friendlyComment = JSON.parse(
                    friendlyCommentResponse.choices[0].message.content
                        .replace(/[\u2018\u2019]/g, "'")
                        .replace(/[\u201c\u201d]/g, '"')
                );
                const classification = JSON.parse(
                    classificationResponse.choices[0].message.content
                        .replace(/[\u2018\u2019]/g, "'")
                        .replace(/[\u201c\u201d]/g, '"')
                );

                suggestions = {
                    corrected_comment: friendlyComment.corrected_comment,
                    classification: classification.incivility,
                };

                // React to the toxic comment
                await reactToUserComment(context, "eyes");
                console.log("Reacted to the toxic comment");
            } catch (err) {
                console.error("Error generating suggestions:", err);
            }
        } else {
            console.log("Comment is not toxic, saving without suggestions...");
        }

        const commentData = {
            comment_id: context.payload.comment.id.toString(),
            user_id: context.payload.comment.user.id.toString(),
            repository_id: context.payload.repository.id.toString(),
            login: context.payload.comment.user.login,
            repo_full_name: context.payload.repository.full_name,
            created_at: context.payload.comment.created_at,
            content: commentBody,
            toxicity: toxicityScore.toString(),
            suggestions,
            solutioned: false,
            solution: null,
        };

        await collection.insertOne(commentData);
        console.log("Comment saved to database:", commentData);
    } catch (error) {
        console.error("Error processing comment:", error);
    }
};
