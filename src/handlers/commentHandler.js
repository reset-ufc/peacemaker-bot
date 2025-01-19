const { TOXICITY_THRESHOLD } = require('../config/constants');
const { detectToxicity } = require('../services/toxicityService');
const { getCommentSuggestions } = require('../services/llmService');
const { reactToComment } = require('../services/githubService');
const { saveComment } = require('../services/dbService');

async function handleComment(context) {
  try {
    const commentBody = context.payload?.comment?.body;
    if (!commentBody) {
      console.error('Missing comment body in payload');
      return;
    }

    const perspectiveResponse = await detectToxicity(commentBody);
    const toxicityScore =
      perspectiveResponse?.attributeScores?.TOXICITY?.summaryScore?.value || 0;
    const language = perspectiveResponse?.languages?.[0] || 'en';

    let suggestions = {};
    let classification = 'neutral';
    if (toxicityScore >= TOXICITY_THRESHOLD) {
      const { friendlyComment, classification: returnedClassification } =
        await getCommentSuggestions(commentBody, language);
      suggestions = {
        corrected_comment: friendlyComment.corrected_comment,
      };
      classification = returnedClassification.incivility;
      await reactToComment(context, 'eyes');

      await saveComment({
        comment_id: context.payload.comment.id.toString(),
        user_id: context.payload.comment.user.id.toString(),
        repository_id: context.payload.repository.id.toString(),
        login: context.payload.comment.user.login,
        repo_full_name: context.payload.repository.full_name,
        created_at: context.payload.comment.created_at,
        content: commentBody,
        toxicity: toxicityScore.toString(),
        suggestions,
        classification,
        solutioned: false,
        solution: null,
      });
    }
  } catch (error) {
    console.error('Comment handling error:', error);
  }
}

module.exports = { handleComment };
