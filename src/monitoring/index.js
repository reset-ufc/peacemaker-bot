const { Probot } = require('probot');
const { MongoClient } = require('mongodb');
const detectToxicity = require('../detection');

// Initialize MongoDB client
const client = new MongoClient(process.env.MONGODB_URI);

module.exports = async function monitorComments(context) {
  const commentBody = context.payload.comment.body;
  const toxicityScore = await detectToxicity(commentBody);

  if (toxicityScore >  0.7) {
    await client.connect();
    const db = client.db('toxicComments');
    const collection = db.collection('comments');
    await collection.insertOne({ comment: commentBody, toxicityScore });
    await client.close();
  }
};
