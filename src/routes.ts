import * as user from 'app/user/user.controller';
import * as profile from 'app/profile/profile.controller';
import * as article from 'app/article/article.controller';
import * as comment from 'app/comment/comment.controller';
import * as tag from 'app/tag/tag.controller';
import { FastifyInstance } from 'fastify';

// async is required by fastify
export default async function routes(fastify: FastifyInstance) {
  fastify.post('/users', user.register);
  fastify.post('/users/login', user.login);
  fastify.get('/user', user.getCurrentUser);
  fastify.put('/user', user.update);

  fastify.get('/profiles/:username', profile.getProfileByUsername);
  fastify.post('/profiles/:username/follow', profile.followByUsername);
  fastify.delete('/profiles/:username/follow', profile.unfollowByUsername);

  fastify.get('/articles', article.listArticles);
  fastify.get('/articles/feed', article.articlesFeed);
  fastify.get('/articles/:slug', article.getArticleBySlug);
  fastify.post('/articles', article.createArticle);
  fastify.put('/articles/:slug', article.updateArticle);
  fastify.delete('/articles/:slug', article.deleteArticle);
  fastify.post('/articles/:slug/favorite', article.markAsFavorite);
  fastify.delete('/articles/:slug/favorite', article.unmarkAsFavorite);

  fastify.get('/articles/:slug/comments', comment.articleComments);
  fastify.post('/articles/:slug/comments', comment.createArticleComment);
  fastify.delete('/articles/:slug/comments/:id', comment.deleteArticleComment);

  fastify.get('/tags', tag.listTags);
}
