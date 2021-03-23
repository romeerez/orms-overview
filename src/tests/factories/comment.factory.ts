import { Factory } from 'fishery';
import { create } from 'tests/utils/create';
import { Comment } from 'app/comment/comment.types';

export const commentFactory = Factory.define<Comment>(
  ({ sequence, onCreate }) => {
    onCreate(async (params) => {
      return await create('comment', params);
    });

    let createdAt = new Date();
    createdAt = new Date(
      createdAt.setFullYear(createdAt.getFullYear() - 1) + sequence * 1000,
    );

    return {
      id: sequence,
      authorId: 1,
      articleId: 1,
      body: `body-${sequence}`,
      updatedAt: createdAt,
      createdAt: createdAt,
    };
  },
);
