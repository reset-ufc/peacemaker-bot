/**
 * This is the main entrypoint to your Probot app
@param {import('probot').Probot} app
 */
const monitorComments = require("./src/monitoring/index.js")
// import getFriendlyComment from "./src/recommendation"

module.exports = (app) => {
    app.log.info("Yay, the app was loaded!")

    app.on("issue_comment.created", async (context) => {
        await monitorComments(context)
    })

    // You would also need to implement a way to handle the updating of comments with friendly versions
}
