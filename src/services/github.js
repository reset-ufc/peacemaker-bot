class GitHubService {
  static async reactToComment(context, reaction, commenterLogin) {
      const { owner, repo } = context.repo()
      const commentId = context.payload.comment.id
      const issueNumber = context.payload.issue.number

      try {
          await context.octokit.reactions.createForIssueComment({
              owner,
              repo,
              comment_id: commentId,
              content: reaction
          })

          await context.octokit.issues.createComment({
              owner,
              repo,
              issue_number: issueNumber,
              body: `@${commenterLogin} Hi there! We noticed some potentially concerning language in your recent comment. Would you mind reviewing our guidelines at https://github.com/apps/thepeacemakerbot? Let's work together to maintain a positive atmosphere.`
          })
      } catch (error) {
          console.error("GitHub interaction error:", error)
      }
  }
}

module.exports = GitHubService