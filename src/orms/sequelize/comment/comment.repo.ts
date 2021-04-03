import { Article } from 'orms/sequelize/article/article.model';
import { ForbiddenError, NotFoundError } from 'errors';
import { User } from 'orms/sequelize/user/user.model';
import { UserFollow } from 'orms/sequelize/user/userFollow.model';
import { Comment } from 'orms/sequelize/comment/comment.model';
import { userToProfile } from 'app/profile/profile.mapper';
import { CommentRepo } from 'orms/types';

export const commentRepo: CommentRepo = {
  async articleComments(slug, currentUser) {
    const article = await Article.findOne({ where: { slug } });
    if (!article) throw new NotFoundError();

    const authorInclude: any = {
      required: true,
      model: User,
      as: 'author',
    };

    if (currentUser) {
      authorInclude.include = {
        required: false,
        model: UserFollow,
        as: 'followedBy',
        where: {
          followerId: currentUser.id,
        },
      };
    }

    const comments = <
      (Comment & {
        author: User & { followedBy?: { followerId: number }[] };
      })[]
    >await article.getComments({ include: [authorInclude], order: [['createdAt', 'DESC']] });

    return comments.map((comment) => {
      const { followedBy } = comment.author;
      const following = Boolean(followedBy && followedBy[0].followerId);

      return {
        ...(<Comment>comment.toJSON()),
        author: userToProfile(<User>comment.author.toJSON(), following),
      };
    });
  },

  async createArticleComment(slug, params, currentUser) {
    const article = await Article.findOne({ where: { slug } });
    if (!article) throw new NotFoundError();

    const now = new Date();
    const comment = await article.createComment({
      ...params,
      authorId: currentUser.id,
      createdAt: now,
      updatedAt: now,
    });

    return {
      ...(<Comment>comment.toJSON()),
      author: userToProfile(currentUser, false),
    };
  },

  async deleteArticleComment(id, currentUser) {
    const comment = await Comment.findOne({
      where: { id },
    });
    if (!comment) throw new NotFoundError();
    if (comment.authorId !== currentUser.id) throw new ForbiddenError();

    await comment.destroy();
  },
};
