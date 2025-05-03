import { Model, getModelEnum } from '@/enums/models.js';
import { Comments } from '@/models/comments.js';
import { CommentType, Parents } from '@/models/parent.js';
import { Suggestions } from '@/models/suggestions.js';
import { ProbotEvent } from '@/schemas/event.js';
import { UserModel } from '@/services/database.js';
import { analyzeToxicity } from '@/services/google-perspective.js';
import {
  generateClassification,
  safeGenerateSuggestions
} from '@/services/groq.js';


export async function handleComment(context: any) {
  // const TOXICITY_THRESHOLD = 0.6;

  const { action, comment, installation, issue, repository, sender } =
    context.payload as ProbotEvent['payload'];
  const { user: author } = comment;

  if (author.type === 'Bot') {
    context.log.info('Skipping bot comment');
    return;
  }
  console.log('author => ', author);
  const user = await UserModel.findOne({ gh_user_id: String(author.id) });
  if (!user) {
    throw new Error('User not found');
  }
  const TOXICITY_THRESHOLD = user.threshold;
  console.log('TOXICITY_THRESHOLD => ', TOXICITY_THRESHOLD);
  const parentType = issue.pull_request ? 'pull_request' : 'issue';

  const llmModel   = getModelEnum(user.llm_id) || Model.LLAMA_3_3_70B_VERSATILE;
  const groqKey   = user!!.groq_api_key   ?? '';
  const openaiKey = user!!.openai_api_key ?? '';

  const { data: perspectiveResponse } = await analyzeToxicity(comment.body.trim());
  console.log(
    'perspectiveResponse => ',
    JSON.stringify(
      {
        language: perspectiveResponse.languages[0],
        score: perspectiveResponse.attributeScores.TOXICITY.summaryScore.value,
      },
      null,
      2,
    ),
  );

  const toxicityScore = perspectiveResponse.attributeScores.TOXICITY.summaryScore.value;
  let commentRecord;
  if (toxicityScore >= TOXICITY_THRESHOLD) {
    // Gera classificação
    const classification = await generateClassification(
      comment.body.trim(),
      perspectiveResponse.languages[0] || 'en',
      llmModel,
      groqKey,
      openaiKey,
    );
    context.log.info(
      'Classification => ',
      JSON.stringify(classification, null, 2),
    );


    if (action === 'edited') {
      commentRecord = await Comments.findOneAndUpdate(
        { gh_comment_id: comment.id },
        {
          content: comment.body,
          toxicity_score: toxicityScore,
          classification: classification,
          parentType,
          created_at: Date.now()
        },
        { new: true }
      );
      console.log('Updated comment record => ', commentRecord?.id);
    } else {
      commentRecord = await Comments.create({
        gh_comment_id: comment.id,
        gh_repository_id: repository.id,
        gh_repository_name: repository.name,
        gh_repository_owner: repository.owner.login,
        gh_comment_sender_id: sender.id,
        gh_comment_sender_login: sender.login,
        content: comment.body,
        event_type: context.name,
        toxicity_score: toxicityScore,
        classification: classification,
        suggestion_id: null,
        parentType,
        comment_html_url: comment.html_url,
        editAttempts: 0,
        needsAttention: false,
        issue_id: issue.id,
        created_at: comment.created_at,
      });
      console.log('Created comment record => ', commentRecord);
    }

    let parent = await Parents.findOne({ gh_parent_id: issue.id });
    console.log("Parent => ", parent);
    if (!parent && action !== 'edited') {
      parent = await Parents.create({
        comment_id: comment.id,
        gh_parent_id: issue.id,
        gh_parent_number: issue.number,
        title: issue.title,
        html_url: issue.html_url,
        is_open: issue.state,
        type: issue.pull_request ? CommentType.PULL_REQUEST : CommentType.ISSUE,
        created_at: issue.created_at,
      });
      console.log('Parent created => ', parent.id);
    }
    if (parent) {
      await Comments.findOneAndUpdate(
        { gh_comment_id: comment.id },
        { parentType: parent.type }
      );
    }

    if (action === 'edited') {
      context.log.info('Processing edited comment...');
      const { data: newPerspectiveResponse } = await analyzeToxicity(comment.body.trim());
      const currentToxicity = newPerspectiveResponse.attributeScores.TOXICITY.summaryScore.value;
      context.log.info(`Reanalysis: toxicity = ${currentToxicity}`);

      if (currentToxicity < TOXICITY_THRESHOLD) {
        context.log.info('Comment is no longer incivilized. Removing bot moderation comment.');
        if (commentRecord && commentRecord.bot_comment_id) {
          try {
            await context.octokit.issues.deleteComment({
              owner: repository.owner.login,
              repo: repository.name,
              comment_id: commentRecord.bot_comment_id,
            });
            context.log.info('Bot moderation comment removed.');

              const suggestion = await Suggestions.findOne({
                gh_comment_id: comment.id,
                content: comment.body,
              });

              await Comments.findOneAndUpdate(
                { gh_comment_id: comment.id },
                { solutioned: true, bot_comment_id: null, suggestion_id: suggestion?._id },
              );
          } catch (err) {
            context.log.error('Error removing bot comment:', err);
          }
        } else {
          context.log.info('No bot comment ID found. Skipping deletion.');
        }
      } else {
        commentRecord = await Comments.findOneAndUpdate(
          { gh_comment_id: comment.id },
          { $inc: { editAttempts: 1 } },
          { new: true }
        );

        if (commentRecord && Number(commentRecord.editAttempts) >= 2 && !commentRecord.needsAttention) {
          commentRecord = await Comments.updateOne(
            { gh_comment_id: comment.id },
            { needsAttention: true }
          );
        }

        context.log.info('Comment is still incivilized. Regenerating suggestions.');
        const newClassification = await generateClassification(
          comment.body.trim(),
          newPerspectiveResponse.languages[0],
          getModelEnum(user!!.llm_id) || Model.LLAMA_3_3_70B_VERSATILE,
          user!!.groq_api_key,
          user!!.openai_api_key,
        );
        context.log.info('New classification:', newClassification);

        if(commentRecord && commentRecord.editAttempts < 2) {
          const suggestions = await safeGenerateSuggestions(
            comment.body.trim(),
            perspectiveResponse.languages[0] || "en",
            llmModel,
            groqKey,
            openaiKey,
            async snippet => {
              const { data } = await analyzeToxicity(snippet);
              return data.attributeScores.TOXICITY.summaryScore.value;
            },
            context,
            TOXICITY_THRESHOLD
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
      }
      return;
    }

    if (
      toxicityScore >= TOXICITY_THRESHOLD
    ) {
      const existingModeration = await Comments.findOne({
        gh_comment_id: comment.id,
        bot_comment_id: { $ne: null },
      });
      if (existingModeration) {
        context.log.info('Bot moderation comment already exists. Skipping creation.');
      } else {
        // const { data: notification } = await context.octokit.reactions.createForIssueComment({
        //   owner: repository.owner.login,
        //   repo: repository.name,
        //   comment_id: comment.id,
        //   content: 'eyes',
        // });
        // context.log.info('Notified moderation', notification);

        const botComment = await context.octokit.issues.createComment({
          owner: repository.owner.login,
          repo: repository.name,
          issue_number: issue.number,
          body: `@${sender.login} Hi there!\n\nWe noticed some potentially concerning language in your comment.\nPlease take a moment to review our guidelines: https://github.com/apps/thepeacemakerbot\n\nWant to better understand and improve your interactions? Visit our dashboard to review your comments and see suggestions for more positive communication: http://localhost:5173/\n\nLet's work together to maintain a positive atmosphere.\n`,
        });
        console.log('botComment => ', JSON.stringify(botComment.data, null, 2));

        await Comments.findOneAndUpdate(
          { gh_comment_id: comment.id },
          { bot_comment_id: botComment.data.id }
        );

        // Gera sugestões de correção "seguras"
        const suggestions = await safeGenerateSuggestions(
          comment.body.trim(),
          perspectiveResponse.languages[0] || "en",
          llmModel,
          groqKey,
          openaiKey,
          async snippet => {
            const { data } = await analyzeToxicity(snippet);
            return data.attributeScores.TOXICITY.summaryScore.value;
          },
          context,
          TOXICITY_THRESHOLD
        );

        console.log('suggestions => ', JSON.stringify(suggestions, null, 2));

        suggestions.map(async suggestion => {
          const suggestionCreated = await Suggestions.create({
            gh_comment_id: comment.id,
            content: suggestion.corrected_comment,
            is_edited: false,
            is_rejected: false,
            created_at: new Date(),
          });
          console.log('Suggestion created => ', JSON.stringify(suggestionCreated.id, null, 2));
        });
      }
    }
  } else {
    // Cria ou atualiza o comentário SEM classificação/sugestões
    if (action === 'edited') {
      commentRecord = await Comments.findOneAndUpdate(
        { gh_comment_id: comment.id },
        {
          content: comment.body,
          toxicity_score: toxicityScore,
          parentType,
          created_at: Date.now()
        },
        { new: true }
      );
      console.log('Updated comment record => ', commentRecord?.id);
    } else {
      commentRecord = await Comments.create({
        gh_comment_id: comment.id,
        gh_repository_id: repository.id,
        gh_repository_name: repository.name,
        gh_repository_owner: repository.owner.login,
        gh_comment_sender_id: sender.id,
        gh_comment_sender_login: sender.login,
        content: comment.body,
        event_type: context.name,
        toxicity_score: toxicityScore,
        parentType,
        comment_html_url: comment.html_url,
        editAttempts: 0,
        needsAttention: false,
        issue_id: issue.id,
        created_at: comment.created_at,
      });
      console.log('Created comment record => ', commentRecord);
    }
    // Não gera classificação nem sugestões
    return;
  }
}
