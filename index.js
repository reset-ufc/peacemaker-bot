/**
 * This is the main entrypoint to your Probot app
@param {import('probot').Probot} app
 */
const { handleComment } = require("./src/handlers/commentHandler");

module.exports = (app) => {
    app.log.info("Peacemaker bot started!");

    app.on(["issue_comment.created", "issue_comment.edited"], handleComment);
};
