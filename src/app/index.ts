import { setupDatabase } from '../services/mongodb';
import { handleIssueComment } from './events/issue-comment-created';

import { type Probot } from 'probot';

export = async (app: Probot) => {
  setupDatabase();

  app.log.info('Peacemaker bot started!');

  app.on('issue_comment.created', handleIssueComment);
  app.on('pull_request_review_comment.created', handleIssueComment);
};
