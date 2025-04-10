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
    context.log.info('Skipping bot comment');
    return;
  }

  // Verifica a toxicidade do comentário
  const { data: perspectiveResponse } = await analyzeToxicity(
    comment.body.trim(),
  );
  context.log.info(
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
  context.log.info(
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
  context.log.info('commentCreated => ', commentCreated.id);

  const parent = await Parents.findOne({
    gh_parent_id: issue.id,
  });

  if (action === 'edited') {
    const { data: perspectiveResponse } = await analyzeToxicity(
      comment.body.trim(),
    );

    const currentToxicity =
      perspectiveResponse.attributeScores.TOXICITY.summaryScore.value;
    context.log.info(`Reanalysis: toxicity = ${currentToxicity}`);

    if (currentToxicity < TOXICITY_THRESHOLD) {
      context.log.info(
        'Comment is no longer incivilized. Removing bot moderation comment.',
      );

      const commentRecord = await Comments.findOne({
        gh_comment_id: comment.id,
      });

      if (commentRecord && commentRecord.bot_comment_id) {
        try {
          await context.octokit.issues.deleteComment({
            owner: repository.owner.login,
            repo: repository.name,
            comment_id: commentRecord.bot_comment_id,
          });
          context.log.info('Bot moderation comment removed.');

          await Comments.findOneAndUpdate(
            { gh_comment_id: comment.id },
            { solutioned: false, suggestion_id: null, bot_comment_id: null },
          );
        } catch (err) {
          context.log.error('Error removing bot comment:', err);
        }
      } else {
        context.log.info('No bot comment ID found. Skipping deletion.');
      }
    } else {
      context.log.info(
        'Comment is still incivilized. Regenerating suggestions.',
      );

      const classification = await generateClassification(
        comment.body.trim(),
        perspectiveResponse.languages[0],
      );
      context.log.info('New classification:', classification.incivility);

      const suggestions = await generateSuggestions(
        comment.body.trim(),
        perspectiveResponse.languages[0],
      );
      context.log.info('New suggestions:', suggestions);

      await Suggestions.deleteMany({ gh_comment_id: comment.id });
      suggestions.map(async suggestion => {
        const suggestionCreated = await Suggestions.create({
          gh_comment_id: comment.id,
          content: suggestion.corrected_comment,
          is_edited: false,
          is_rejected: false,
          created_at: new Date(),
        });
        context.log.info('Suggestion created:', suggestionCreated.id);
      });
    }
    return;
  }

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
    context.log.info('parent => ', parentCreated.id);
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
    context.log.info(
      'botComment => ',
      JSON.stringify(botComment.data, null, 2),
    );

    await Comments.findOneAndUpdate(
      { gh_comment_id: comment.id },
      { bot_comment_id: botComment.data.id },
    );

    // gera as sugestões de solução
    const suggestions = await generateSuggestions(
      comment.body.trim(),
      perspectiveResponse.languages[0],
    );
    context.log.info('suggestions => ', JSON.stringify(suggestions, null, 2));

    suggestions.map(async suggestion => {
      const suggestionCreated = await Suggestions.create({
        gh_comment_id: comment.id,
        content: suggestion.corrected_comment,
        is_edited: false,
        is_rejected: false,
        created_at: new Date(),
      });
      context.log.info(
        'suggestionCreated => ',
        JSON.stringify(suggestionCreated.id, null, 2),
      );
    });
  }
}
