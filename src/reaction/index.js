module.exports = async function reactToUserComment(context, reactionType) {
    const { owner, repo } = context.repo()
    const comment_id = context.payload.comment.id

    try {
        // React to the user's comment
        await context.octokit.reactions.createForIssueComment({
            owner,
            repo,
            comment_id,
            content: reactionType
        })

        const commenterLogin = context.payload.comment.user.login
        const replyComment = `@${commenterLogin} Hi there! We noticed some potentially concerning language in your recent comment. Would you mind reviewing our guidelines at https://github.com/apps/thepeacemakerbot? Let's work together to maintain a positive atmosphere.`


        await context.octokit.issues.createComment({
            owner,
            repo,
            issue_number: context.payload.issue.number,
            body: replyComment
        })

        console.log(`Reacted with ${reactionType} to comment ${comment_id}`)
        console.log(`Posted reply comment to ${commenterLogin}`)
    } catch (error) {
        console.error("Failed to react or post comment:", error)
    }
}
