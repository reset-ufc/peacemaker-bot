/**
 * This is the main entrypoint to your Probot app
@param {import('probot').Probot} app
 */
const monitorComments = require("./src/monitoring/index.js")

module.exports = (app) => { 
    app.log.info("Yay, the app was loaded!")

    app.on("issue_comment.created", async (context) => {
        await monitorComments(context)
    })

    app.on("issue_comment.edited", async (context) => {
        await monitorComments(context)
    })
}
