import { type Probot } from 'probot';

import './env.js';
import { handleComment } from './event/comment.js';
import { setupDatabase } from './services/database.js';

export default async function initializeApp(app: Probot) {
  setupDatabase().then(() => {
    app.log.info('mongodb connected');
  });

  app.on(['issue_comment.created', 'issue_comment.edited'], handleComment);
  app.on(
    [
      'pull_request_review_comment.created',
      'pull_request_review_comment.edited',
    ],
    handleComment,
  );

  app.log.info('Peacemaker bot started!');

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
