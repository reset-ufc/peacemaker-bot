const { MongoClient } = require("mongodb")
const config = require("../config")

class DatabaseService {
    constructor() {
        this.client = new MongoClient(process.env.MONGODB_URI)
        this.connected = false
    }

    async connect() {
        if (!this.connected) {
            await this.client.connect()
            this.connected = true
        }
        return this.client.db(process.env.MONGODB_DB).collection(config.MONGODB_COLLECTION)
    }

    async saveComment(commentData) {
        const collection = await this.connect()
        await collection.insertOne(commentData)
    }
}

module.exports = new DatabaseService()