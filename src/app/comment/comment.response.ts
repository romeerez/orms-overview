import { CommentForResponse } from 'app/comment/comment.types';

const convertComment = (comment: CommentForResponse) => ({
  id: comment.id,
  createdAt: comment.createdAt,
  updatedAt: comment.updatedAt,
  body: comment.body,
  author: comment.author,
});

export const comment = (comment: CommentForResponse) => ({
  comment: convertComment(comment),
});

export const comments = (comments: CommentForResponse[]) => ({
  comments: comments.map(convertComment),
});
