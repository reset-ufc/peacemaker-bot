# :checkered_flag: THE PEACEMAKER BOT

> A GitHub App built with [Probot](https://github.com/probot/probot) that is a bot to analyze Github comments and moderate them

### Setup

```sh
# Install dependencies
npm install
# Run the bot
npm start
```

### Docker

```sh
# 1. Build container
docker build -t thepeacemakerbot .
# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> thepeacemakerbot
```

### Contributing

If you have suggestions for how thepeacemakerbot could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

# ThePeacemakerBot 🤖

**A GitHub bot to analyze, moderate, and improve comments, fostering a positive and inclusive environment.**

---

## Features 🚀

- **Toxicity Detection**: Identifies potentially toxic comments using Google's Perspective API.  
- **Language Classification**: Analyzes the language of comments and provides targeted recommendations.  
- **Friendly Comment Suggestions**: Leverages a powerful LLM (Groq API) to suggest alternative, polite versions of comments.  
- **Automated Reactions**: Reacts to toxic comments with GitHub emojis and posts a response.  
- **Comment Moderation**: Automatically saves toxic comments and classifications to a database for further review.  
- **Edit Monitoring**: Handles edited comments by re-evaluating their toxicity and adjusting reactions or responses accordingly.  

---

## Installation 🛠️

1. **Clone the repository**:  
   ```bash
   git clone https://github.com/<your-repo-name>/peacemaker-bot.git
   cd peacemaker-bot

    Install dependencies:

npm install

Set up environment variables:
Create a .env file in the root directory and add the following:

NODE_ENV=development
PORT=4000
PERSPECTIVE_API_KEY=<your_google_perspective_api_key>
DISCOVERY_URL=https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1
MONGODB_URI=<your_mongodb_connection_string>
GROQ_API_KEY=<your_groq_api_key>

Replace the placeholders with your actual keys and connection strings.

Run the bot locally:

npm start

The bot will be available at http://localhost:4000.

Set up a Smee client for local testing (optional):
Use Smee.io to forward GitHub webhook events to your local machine:

    npx smee -u <your-smee-url> -p 4000

Usage 💡
Subscribed GitHub Events

    issue_comment.created
    issue_comment.edited

How It Works

    Comment Creation:
        When a comment is created, the bot:
            Analyzes the comment for toxicity.
            Classifies the type of incivility (if detected).
            Suggests a friendlier version of the comment.
            Reacts to the comment with an emoji and posts a warning if toxic.

    Comment Edit:
        If the edited comment is toxic:
            Reacts if no reaction exists.
        If the edited comment is not toxic:
            Removes any previous reactions and replies.

    Data Storage:
        Toxic comments, classifications, and recommendations are saved in a MongoDB database using the /gh-comments API route.

Directory Structure 📁

.
├── src
│   ├── detection          # Toxicity detection logic using Google's Perspective API
│   ├── llm                # Groq API integration for comment classification & suggestions
│   ├── mongo              # MongoDB connection setup
│   ├── monitoring         # Main logic for handling events and processing comments
│   └── reaction           # Handles emoji reactions and reply comments on GitHub
├── app.yml                # GitHub App configuration
├── index.js               # Main entry point for the bot
├── package.json           # Project metadata and dependencies
└── .env                   # Environment variables (ignored by Git)

API Endpoints 🌐

The bot interacts with an internal API for saving data. Below are the relevant endpoints:
POST /gh-comments

Body:

{
  "comment_id": "string",
  "github_id": "string",
  "repo_id": "string",
  "login": "string",
  "repo_full_name": "string",
  "comment": "string",
  "classification": "string",
  "toxicity_score": 0,
  "friendly_comment": "string",
  "solved": true,
  "solution": "string"
}

Example Request

curl -X POST http://localhost:3000/gh-comments \
-H "Content-Type: application/json" \
-d '{
  "comment_id": "12345",
  "github_id": "67890",
  "repo_id": "54321",
  "login": "username",
  "repo_full_name": "owner/repo",
  "comment": "This is a toxic comment",
  "classification": "insult",
  "toxicity_score": 0.95,
  "friendly_comment": "Could you please clarify your point politely?",
  "solved": false,
  "solution": null
}'

Testing 🧪

Run tests using Jest:

npm test

Contributing 🤝

    Fork the repository.
    Create a feature branch:

git checkout -b feature-name

Commit your changes:

git commit -m "Add feature name"

Push to your fork:

    git push origin feature-name

    Create a pull request.

License 📜

This project is licensed under the ISC License.
Acknowledgments 💖

    Probot Framework
    Google Perspective API
    Groq SDK
    MongoDB

Made with ❤️ by RESET Lab