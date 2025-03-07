import { mock_analyzeToxicity as analyzeToxicity } from '../../services/google-perspective';

export const handleIssueComment = async (context: any) => {
  const TOXICITY_THRESHOLD = 0.6;

  const { comment, issue, repository, installation } = context.payload;
  const { user: author } = comment;

  if (author.type === 'Bot') {
    console.log('Skipping bot comment');
    return;
  }

  const pespertiveResponse = await analyzeToxicity(comment.body);

  console.log(
    'pespertiveResponse',
    JSON.stringify({ pespertiveResponse }, null, 2),
  );

  // // Dados do comentário
  // const commentData = {
  //   gh_comment_id: comment.id,
  //   content: comment.body || '',
  //   comment_created_at: new Date(comment.created_at),
  //   author_id: author.id.toString(),

  //   // Contexto do objeto pai (Issue ou PR)
  //   parent: {
  //     gh_parent_id: issue.number,
  //     type: issue.pull_request ? CommentType.PULL_REQUEST : CommentType.ISSUE,
  //     title: issue.title,
  //     url: issue.html_url,
  //   },

  //   // Dados do repositório
  //   repository_fullname: repository.full_name,
  //   is_repository_private: repository.private,
  //   repository_owner: repository.owner.login,

  //   // Análise de toxicidade
  //   toxicity_score: pespertiveResponse.toxicityScore,
  //   toxicity_analyzed_at: new Date(),
  //   flagged: pespertiveResponse.toxicityScore >= TOXICITY_THRESHOLD,
  //   classification: 'neutral',

  //   solutioned: false,
  //   solution: '',
  //   solution_analyzed_at: null,

  //   // Metadados do evento
  //   event_type: context.name, // 'issue_comment.created'
  //   installation_id: installation.id,
  //   moderated: false, // Inicialmente não moderado
  //   moderation_action: null,
  // };

  // console.log('comment', JSON.stringify({ comment: commentData }, null, 2));

  // if (pespertiveResponse.toxicityScore >= TOXICITY_THRESHOLD) {
  //   // Enviar notificação de moderação
  //   const { data: notification } =
  //     await context.octokit.reactions.createForIssueComment({
  //       owner: repository.owner.login,
  //       repo: repository.name,
  //       comment_id: comment.id,
  //       content: 'eyes',
  //     });

  //   console.log('notification', JSON.stringify({ notification }, null, 2));

  //   // Adiciona um comentário para notificar que a moderação foi feita
  //   await context.octokit.issues.createComment({
  //     owner: repository.owner.login,
  //     repo: repository.name,
  //     issue_number: issue.number,
  //     body: `@${context.payload.sender.login} Hi there! We noticed some potentially concerning language in your recent comment. Would you mind reviewing our guidelines at https://github.com/apps/thepeacemakerbot? Let's work together to maintain a positive atmosphere.`,
  //   });
  // }
};
