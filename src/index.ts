import { type Probot } from 'probot';

import { handleComment } from './event/comment.js';
import { setupDatabase } from './services/database.js';

export default async function initializeApp(app: Probot) {
  setupDatabase();

  app.on('issue_comment.created', handleComment);
  app.on('pull_request_review_comment.created', handleComment);

  app.log.info('Peacemaker bot started!');

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
