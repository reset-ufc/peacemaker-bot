async function reactToComment(context, reactionType) {
  const { owner, repo } = context.repo();
  const comment_id = context.payload.comment.id;
  const commenterLogin = context.payload.comment.user.login;

  try {
    await context.octokit.reactions.createForIssueComment({
      owner,
      repo,
      comment_id,
      content: reactionType,
    });

    const botComment = await context.octokit.issues.createComment({
      owner,
      repo,
      issue_number: context.payload.issue.number,
      body: `@${commenterLogin} Hi there! We noticed some potentially concerning language in your recent comment. Would you mind reviewing our guidelines at https://github.com/apps/thepeacemakerbot? Let's work together to maintain a positive atmosphere.`,
    });

    // Store the bot comment ID for potential removal later
    return botComment.data.id;
  } catch (error) {
    console.error('GitHub interaction error:', error);
    throw error;
  }
}

async function removeReactionAndComment(context) {
  try {
    const { owner, repo } = context.repo();
    const comment_id = context.payload.comment?.id;

    // Check if comment_id is valid
    if (!comment_id) {
      throw new Error("Comment ID is missing or undefined.");
    }

    console.log("Removing reactions for comment ID:", comment_id);

    // List all reactions on the comment
    const reactions = await context.octokit.reactions.listForIssueComment({
      owner,
      repo,
      comment_id,
    });

    // Remove bot reactions (eyes)
    for (const reaction of reactions.data) {
      if (reaction.content === "eyes") {
        await context.octokit.reactions.deleteForIssueComment({
          owner,
          repo,
          comment_id,
          reaction_id: reaction.id, // Use the reaction ID to delete
        });
        console.log(`Removed reaction ID: ${reaction.id}`);
      }
    }
  } catch (error) {
    console.error("Error removing reactions:", error);
    throw error;
  }
}


module.exports = { 
  reactToComment, 
  removeReactionAndComment 
};