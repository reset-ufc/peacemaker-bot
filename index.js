/**
 * This is the main entrypoint to your Probot app
@param {import('probot').Probot} app
 */
const { handleComment, handleCommentEdit } = require("./src/handlers/commentHandler");

module.exports = (app) => {
    app.log.info("Peacemaker bot started!");

    // Save all comments
    app.on("issue_comment.created", handleComment);
    
    // Handle toxic comment edits
    app.on("issue_comment.edited", handleCommentEdit);
};

