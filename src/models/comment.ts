import { ObjectId } from 'mongodb';
import mongoose, { Schema, Types } from 'mongoose';

export enum CommentType {
  ISSUE = 'issue',
  PULL_REQUEST = 'pull_request',
}

export interface CommentDocument extends mongoose.Document {
  gh_comment_id: string; // id do comentário no GitHub
  content: string; // conteudo do comentário
  comment_created_at: Date; // data de criação do comentário
  author_id: string; // id do autor do comentário

  // Contexto do objeto pai (Issue/PR)
  parent: {
    type: CommentType; // tipo do objeto pai
    gh_parent_id: number; // id do objeto pai no GitHub
    title: string; // título do objeto pai
    url: string; // url do objeto pai
  };

  repository_fullname: string; // nome completo do repositório
  is_repository_private: boolean; // se o repositório é privado
  repository_owner: string; // nome do dono do repositório

  toxicity_score: number; // pontuação de toxicidade
  toxicity_analyzed_at: Date; // data em que a pontuação foi analisada
  flagged: boolean; // se o comentário foi sinalizado como inapropriado
  classification: string; // classificação do comentário

  // Contexto do comentário
  solutioned: boolean; // se o comentário foi solucionado
  solution: string; // solução do comentário (sugestão que foi aceita ou escrita pelo autor)
  solution_analyzed_at: Date; // data em que a solução foi analisada
  solution_id: ObjectId; // id da solução do comentário

  // Metadados do evento
  event_type: string; // tipo de evento
  installation_id: number; // id da instalação
  moderated: boolean; // se o comentário foi moderado
  moderation_action: string | null; // ação de moderação
}

const CommentSchema = new Schema<CommentDocument>({
  gh_comment_id: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  comment_created_at: { type: Date, required: true },
  author_id: { type: String, required: true },

  parent: {
    type: { type: String, enum: Object.values(CommentType), required: true },
    gh_parent_id: { type: Number, required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
  },

  repository_fullname: { type: String, required: true },
  is_repository_private: { type: Boolean, required: true },
  repository_owner: { type: String, required: true },

  toxicity_score: { type: Number, required: true },
  toxicity_analyzed_at: { type: Date, required: true },
  flagged: { type: Boolean, required: true, default: false },
  classification: { type: String, required: true },

  solutioned: { type: Boolean, required: true, default: false },
  solution: { type: String, required: false },
  solution_analyzed_at: { type: Date, required: false },
  solution_id: { type: Types.ObjectId, required: false },

  event_type: { type: String, required: true },
  installation_id: { type: Number, required: true },
  moderated: { type: Boolean, required: true },
  moderation_action: { type: String, required: false },
});

export const Comment = mongoose.model<CommentDocument>(
  'Comment',
  CommentSchema,
);
