const { saveComment, updateCommentToxicity, findBotCommentId } = require('./dbService');

async function reactToComment(context, reactionType) {
  const { owner, repo } = context.repo();
  const comment_id = context.payload.comment.id;
  const commenterLogin = context.payload.comment.user.login;
  const issueNumber = context.payload.issue.number;

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
      issue_number: issueNumber,
      body: `@${commenterLogin} Hi there! We noticed some potentially concerning language in your recent comment. Would you mind reviewing our guidelines at https://github.com/apps/thepeacemakerbot? Let's work together to maintain a positive atmosphere.`,
    });

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
    const issueNumber = context.payload.issue.number;

    if (!comment_id) {
      throw new Error("Comment ID is missing or undefined.");
    }

    const reactions = await context.octokit.reactions.listForIssueComment({
      owner,
      repo,
      comment_id,
    });

    for (const reaction of reactions.data) {
      if (reaction.content === "eyes") {
        await context.octokit.reactions.deleteForIssueComment({
          owner,
          repo,
          comment_id,
          reaction_id: reaction.id,
        });
      }
    }

    const botCommentId = await findBotCommentId(comment_id);
    
    if (botCommentId) {
      // 3. Delete the bot comment using the stored bot_comment_id
      await context.octokit.issues.deleteComment({
        owner,
        repo,
        comment_id: botCommentId, // Use bot_comment_id from the database
      });
      console.log(`Deleted bot comment with ID: ${botCommentId}`);
    } else {
      console.log("No bot comment found to delete.");
    }
    
  } catch (error) {
    console.error("Error removing reactions and bot comment:", error);
    throw error;
  }
}

module.exports = { 
  reactToComment, 
  removeReactionAndComment 
};