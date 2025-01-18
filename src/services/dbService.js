const { MongoClient } = require("mongodb");
const { MONGODB_URI, MONGODB_DB } = require("../config/constants");

const client = new MongoClient(MONGODB_URI, { maxConnecting: 1 });

async function saveComment(commentData) {
    try {
        await client.connect();
        const collection = client.db(MONGODB_DB).collection("comments");
        await collection.insertOne(commentData);
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}

module.exports = { saveComment };