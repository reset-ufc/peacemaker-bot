const { MongoClient } = require('mongodb');
const { MONGODB_URI, MONGODB_DB } = require('../config/constants');

const client = new MongoClient(MONGODB_URI, { maxConnecting: 1 });

async function saveComment(commentData) {
  try {
    await client.connect();
    const collection = client.db(MONGODB_DB).collection('comments');
    const result = await collection.insertOne(commentData);
    return result;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

// TODO: Precisa de correção, ao salvar as sugestões, adiciona um id para identificar na hora do feedback.
async function saveSuggestion(suggestionData) {
  try {
    await client.connect();
    const collection = client.db(MONGODB_DB).collection('suggestions');
    const result = await collection.insertOne(suggestionData);
    return result;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

async function updateCommentToxicity(commentId, updateData) {
  try {
    await client.connect();
    const collection = client.db(MONGODB_DB).collection('comments');

    await collection.updateOne({ comment_id: commentId }, { $set: updateData });
  } catch (error) {
    console.error('Database update error:', error);
    throw error;
  }
}

async function findBotCommentId(commentId) {
  try {
    await client.connect();
    const collection = client.db(MONGODB_DB).collection('comments');
    const result = await collection.findOne({
      comment_id: commentId.toString(),
    });
    console.log('Bot comment ID found:', result);
    return result.bot_comment_id;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

module.exports = {
  saveComment,
  saveSuggestion,
  updateCommentToxicity,
  findBotCommentId,
};
