const { TOXICITY_THRESHOLD } = require('../config/constants');
const { detectToxicity } = require('../services/toxicityService');
const { getCommentSuggestions } = require('../services/llmService');
const { reactToComment, removeReactionAndComment } = require('../services/githubService');
const { saveComment, updateCommentToxicity } = require('../services/dbService');

async function handleComment(context) {
  try {
    const commentBody = context.payload?.comment?.body;
    const commentId = context.payload.comment.id.toString();
    const userId = context.payload.comment.user.id.toString();
    const userLogin = context.payload.comment.user.login;
    const userType = context.payload.comment.user.type; 
    const repositoryId = context.payload.repository.id.toString();
    const repoFullName = context.payload.repository.full_name;

    if (!commentBody) {
      console.error('Missing comment body in payload');
      return;
    }

    if (userType === 'Bot') {
      console.log('Skipping bot comment');
      return;
    }

    const perspectiveResponse = await detectToxicity(commentBody);
    const toxicityScore = perspectiveResponse?.attributeScores?.TOXICITY?.summaryScore?.value || 0;
    const language = perspectiveResponse?.languages?.[0] || 'en';

    // Always save the comment
    const commentData = {
      comment_id: commentId,
      user_id: userId,
      repository_id: repositoryId,
      login: userLogin,
      repo_full_name: repoFullName,
      created_at: context.payload.comment.created_at,
      content: commentBody,
      toxicity: toxicityScore.toString(),
      solutioned: false,
      solution: null,
      suggestions: { corrected_comment: null },
      classification: "neutral",
      bot_comment_id: null, 
    };

    let savedComment = await saveComment(commentData);

    if (toxicityScore >= TOXICITY_THRESHOLD) {
      const { friendlyComment, classification } = await getCommentSuggestions(commentBody, language);
      
      const botCommentId = await reactToComment(context, 'eyes');
      
      const updatedCommentData = {
        ...commentData,
        suggestions: {
          corrected_comment: friendlyComment.corrected_comment,
        },
        classification: classification.incivility,
        bot_comment_id: botCommentId.toString(), 
      };

      await updateCommentToxicity(commentId, updatedCommentData);
    }
  } catch (error) {
    console.error('Comment handling error:', error);
  }
}

async function handleCommentEdit(context) {
  try {
    const commentBody = context.payload?.comment?.body;
    const commentId = context.payload.comment.id.toString();
    const userType = context.payload.comment.user.type;

    if (!commentBody) {
      console.error('Missing comment body in payload');
      return;
    }

    if (userType === 'Bot') {
      console.log('Skipping bot comment edit');
      return;
    }

    const perspectiveResponse = await detectToxicity(commentBody);
    const toxicityScore =
      perspectiveResponse?.attributeScores?.TOXICITY?.summaryScore?.value || 0;

    if (toxicityScore < TOXICITY_THRESHOLD) {
      await removeReactionAndComment(context);
      
      await updateCommentToxicity(commentId, {
        toxicity: toxicityScore.toString(),
        solutioned: true,
      });
    }
  } catch (error) {
    console.error('Comment edit handling error:', error);
  }
}

module.exports = { 
  handleComment,
  handleCommentEdit 
};