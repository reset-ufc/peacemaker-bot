require("dotenv").config() // Load environment variables from .env file
const { MongoClient } = require("mongodb")

const uri = process.env.MONGODB_URI // Use the MONGODB_URI environment variable
const client = new MongoClient(uri)


module.exports = { client }
