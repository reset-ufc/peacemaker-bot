import { Comment, CommentType } from '../../models/comment';
import { Suggestions, SuggestionsDocument } from '../../models/suggestions';
import { analyzeToxicity } from '../../services/google-perspective';
import {
  generateClassification,
  generateSuggestions,
} from '../../services/groq';

export const handleIssueComment = async (context: any) => {
  const TOXICITY_THRESHOLD = 0.6;

  const { comment, issue, repository, installation } = context.payload;
  const { user: author } = comment;

  if (author.type === 'Bot') {
    console.log('Skipping bot comment');
    return;
  }

  // Verifica a toxicidade do comentário
  const pespertiveResponse = await analyzeToxicity(comment.body.trim());
  console.log(
    'pespertiveResponse => ',
    JSON.stringify(pespertiveResponse, null, 2),
  );

  // classifica o comentario como uma das categorias descritas
  // 'bitter_frustration', 'mocking', 'irony', 'insulting', 'vulgarity', 'identity_attack', 'entitlement', 'impatience', 'threat', 'neutral',
  const classification = await generateClassification(
    comment.body.trim(),
    pespertiveResponse.language,
  );
  console.log(
    'Classification => ',
    JSON.stringify(classification.incivility, null, 2),
  );

  // Dados do comentário
  const commentData = {
    gh_comment_id: comment.id,
    content: comment.body.trim(),
    comment_created_at: new Date(comment.created_at),
    author_id: author.id.toString(),

    // Contexto do objeto pai (Issue ou PR)
    parent: {
      gh_parent_id: issue.number,
      type: issue.pull_request ? CommentType.PULL_REQUEST : CommentType.ISSUE,
      title: issue.title,
      url: issue.html_url,
    },

    // Dados do repositório
    repository_fullname: repository.full_name,
    is_repository_private: repository.private,
    repository_owner: repository.owner.login,

    // Análise de toxicidade
    toxicity_score: pespertiveResponse.toxicityScore,
    toxicity_analyzed_at: new Date(),
    flagged: pespertiveResponse.toxicityScore >= TOXICITY_THRESHOLD,
    classification: classification.incivility.trim(),

    // solução do comentário
    solutioned: false,

    // Metadados do evento
    event_type: context.name, // 'issue_comment.created'
    installation_id: installation.id,
    moderated: false, // Inicialmente não moderado
    moderation_action: null,
  };

  const commentCreated = await Comment.create(commentData);
  console.log('comment created => ', JSON.stringify(commentCreated, null, 2));

  if (pespertiveResponse.toxicityScore >= TOXICITY_THRESHOLD) {
    // Enviar notificação de moderação
    const { data: notification } =
      await context.octokit.reactions.createForIssueComment({
        owner: repository.owner.login,
        repo: repository.name,
        comment_id: comment.id,
        content: 'eyes',
      });
    console.log('notification => ', JSON.stringify(notification, null, 2));

    // Adiciona um comentário para notificar que a moderação foi feita
    const botComment = await context.octokit.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      body: `@${context.payload.sender.login} Hi there! We noticed some potentially concerning language in your recent comment. Would you mind reviewing our guidelines at https://github.com/apps/thepeacemakerbot? Let's work together to maintain a positive atmosphere.`,
    });
    console.log('botComment => ', JSON.stringify(botComment, null, 2));

    // gera as sugestões de solução
    const suggestions = await generateSuggestions(
      comment.body.trim(),
      pespertiveResponse.language,
    );
    console.log('suggestions => ', JSON.stringify(suggestions, null, 2));

    // Cria um documento com as sugestões
    const suggestionsData = {
      gh_comment_id: comment.id,
      suggestions: suggestions.map(suggestion => ({
        content: suggestion.corrected_comment,
      })),
      is_edited: false,
      suggestion_selected_index: null,
    } as SuggestionsDocument;

    const suggestionsCreated = await Suggestions.create(suggestionsData);
    console.log(
      'suggestionsCreated => ',
      JSON.stringify(suggestionsCreated, null, 2),
    );
  }
};
