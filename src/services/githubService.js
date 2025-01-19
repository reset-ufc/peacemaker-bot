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

    await context.octokit.issues.createComment({
      owner,
      repo,
      issue_number: context.payload.issue.number,
      body: `@${commenterLogin} Hi there! We noticed some potentially concerning language in your recent comment. Would you mind reviewing our guidelines at https://github.com/apps/thepeacemakerbot? Let's work together to maintain a positive atmosphere.`,
    });
  } catch (error) {
    console.error('GitHub interaction error:', error);
    throw error;
  }
}

module.exports = { reactToComment };
