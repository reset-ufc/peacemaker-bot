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
        console.log(`Reacted with ${reactionType} to comment ${comment_id}`)
    } catch (error) {
        console.error("Failed to create reaction:", error)
    }
}
