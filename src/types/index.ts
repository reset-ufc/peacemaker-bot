import { Context, Probot, ProbotOctokit } from 'probot';

export type ProbotApp = Probot & ProbotOctokit & Context;

export enum ClassificationType {
  'BITTER_FRUSTRATION' = 'bitter_frustration',
  'MOCKING' = 'mocking',
  'IRONY' = 'irony',
  'INSULTING' = 'insulting',
  'VULGARITY' = 'vulgarity',
  'IDENTITY_ATTACK' = 'identity_attack',
  'ENTITLEMENT' = 'entitlement',
  'IMPATIENCE' = 'impatience',
  'THREAT' = 'threat',
  'NEUTRAL' = 'neutral',
}
