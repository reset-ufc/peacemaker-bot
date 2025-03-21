import { Comments } from '@/models/comments.js';
import { CommentType, Parents } from '@/models/parent.js';
import { Suggestions } from '@/models/suggestions.js';
import { ProbotEvent } from '@/schemas/event.js';
import { analyzeToxicity } from '@/services/google-perspective.js';
import {
  generateClassification,
  generateSuggestions,
} from '@/services/groq.js';

export async function handleComment(context: any) {
  const TOXICITY_THRESHOLD = 0.6;

  const { action, comment, installation, issue, repository, sender } =
    context.payload as ProbotEvent['payload'];

  const { user: author } = comment;

  if (author.type === 'Bot') {
    console.log('Skipping bot comment');
    return;
  }

  // Verifica a toxicidade do comentário
  const { data: perspectiveResponse } = await analyzeToxicity(
    comment.body.trim(),
  );
  console.log(
    'pespertiveResponse => ',
    JSON.stringify(
      {
        language: perspectiveResponse.languages[0],
        score: perspectiveResponse.attributeScores.TOXICITY.summaryScore.value,
      },
      null,
      2,
    ),
  );

  // classifica o comentario como uma das categorias descritas
  // 'bitter_frustration', 'mocking', 'irony', 'insulting', 'vulgarity', 'identity_attack', 'entitlement', 'impatience', 'threat', 'neutral',
  const classification = await generateClassification(
    comment.body.trim(),
    perspectiveResponse.languages[0],
  );
  console.log(
    'Classification => ',
    JSON.stringify(classification.incivility, null, 2),
  );

  const commentCreated = await Comments.create({
    gh_comment_id: comment.id,
    gh_repository_id: repository.id,
    gh_repository_name: repository.name,
    gh_repository_owner: repository.owner.login,
    gh_comment_sender_id: sender.id,
    gh_comment_sender_login: sender.login,
    content: comment.body,
    event_type: context.name,
    toxicity_score:
      perspectiveResponse.attributeScores.TOXICITY.summaryScore.value,
    classification: classification.incivility,
    suggestion_id: null,
    comment_html_url: comment.html_url,
    issue_id: issue.id,
    created_at: comment.created_at,
  });
  console.log('commentCreated => ', commentCreated.id);

  const parent = await Parents.findOne({
    gh_parent_id: issue.id,
  });

  if (!parent) {
    const parentCreated = await Parents.create({
      comment_id: comment.id,
      gh_parent_id: issue.id,
      gh_parent_number: issue.number,
      title: issue.title,
      html_url: issue.html_url,
      is_open: issue.state,
      type: issue.pull_request ? CommentType.PULL_REQUEST : CommentType.ISSUE,
      created_at: issue.created_at,
    });
    console.log('parent => ', parentCreated.id);
  }

  if (
    perspectiveResponse.attributeScores.TOXICITY.summaryScore.value >=
    TOXICITY_THRESHOLD
  ) {
    // Enviar notificação de moderação
    const { data: notification } =
      await context.octokit.reactions.createForIssueComment({
        owner: repository.owner.login,
        repo: repository.name,
        comment_id: comment.id,
        content: 'eyes',
      });
    context.log.info('Notified moderation', notification);

    // Adiciona um comentário para notificar que a moderação foi feita
    const botComment = await context.octokit.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      body: `@${sender.login} Hi there!\n\nnoticed some potentially concerning language in your recent comment.\n Would you mind reviewing our guidelines at https://github.com/apps/thepeacemakerbot?\n\nLet's work together to maintain a positive atmosphere.\n`,
    });
    console.log('botComment => ', JSON.stringify(botComment.data, null, 2));

    // gera as sugestões de solução
    const suggestions = await generateSuggestions(
      comment.body.trim(),
      perspectiveResponse.languages[0],
    );
    console.log('suggestions => ', JSON.stringify(suggestions, null, 2));

    suggestions.map(async suggestion => {
      const suggestionCreated = await Suggestions.create({
        gh_comment_id: comment.id,
        content: suggestion.corrected_comment,
        is_edited: false,
        created_at: new Date(),
      });
      console.log(
        'suggestionCreated => ',
        JSON.stringify(suggestionCreated.id, null, 2),
      );
    });
  }
}
