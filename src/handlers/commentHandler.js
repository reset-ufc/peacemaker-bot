const { TOXICITY_THRESHOLD } = require('../config/constants');
const { detectToxicity } = require('../services/toxicityService');
const { getCommentSuggestions } = require('../services/llmService');
const { reactToComment, removeReactionAndComment } = require('../services/githubService');
const { saveComment, updateCommentToxicity } = require('../services/dbService');

async function handleComment(context) {
  try {

    if (!commentBody) {
      console.error('Missing comment body in payload');
      return;
    }

    // Check if the comment is from a bot
    if (userLogin.toLowerCase().includes('bot')) {
      console.log('Skipping bot comment');
      return;
    }

    const perspectiveResponse = await detectToxicity(commentBody);
    const toxicityScore =
      perspectiveResponse?.attributeScores?.TOXICITY?.summaryScore?.value || 0;
    const language = perspectiveResponse?.languages?.[0] || 'en';

    // Always save the comment
    const commentData = {
      comment_id: context.payload.comment.id.toString(),
      user_id: context.payload.comment.user.id.toString(),
      repository_id: context.payload.repository.id.toString(),
      login: context.payload.comment.user.login,
      repo_full_name: context.payload.repository.full_name,
      created_at: context.payload.comment.created_at,
      content: context.payload?.comment?.body,
      toxicity: toxicityScore.toString(),
      solutioned: false,
      solution: null,
      classification: "neutral",
      suggestions: null,
    };

    let savedComment = await saveComment(commentData);

    // Handle toxic comments
    if (toxicityScore >= TOXICITY_THRESHOLD) {
      const { friendlyComment, classification } = await getCommentSuggestions(commentBody, language);
      
      // Update comment with suggestions and classification
      const updatedCommentData = {
        ...commentData,
        suggestions: {
          corrected_comment: friendlyComment.corrected_comment,
        },
        classification: classification.incivility,
      };

      await updateCommentToxicity(commentId, updatedCommentData);

      // React and comment for toxic comments
      await reactToComment(context, 'eyes');
    }
  } catch (error) {
    console.error('Comment handling error:', error);
  }
}

// New function to handle comment edits specifically
async function handleCommentEdit(context) {
  try {
    const commentBody = context.payload?.comment?.body;
    const commentId = context.payload.comment.id.toString();

    if (!commentBody) {
      console.error('Missing comment body in payload');
      return;
    }

    const perspectiveResponse = await detectToxicity(commentBody);
    const toxicityScore =
      perspectiveResponse?.attributeScores?.TOXICITY?.summaryScore?.value || 0;

    // If comment is now non-toxic, remove previous reactions and comments
    if (toxicityScore < TOXICITY_THRESHOLD) {
      await removeReactionAndComment(context);
      
      // Update comment toxicity in database
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