import {
  AbstractNamingStrategy,
  MikroORM,
  NamingStrategy,
} from '@mikro-orm/core';
import config from 'config';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Article } from './article/article.model';
import { ArticleTag } from './article/articleTag.model';
import { UserArticleFavorite } from './article/userArticleFavorite.model';
import { Comment } from './comment/comment.model';
import { Tag } from './tag/tag.model';
import { User } from './user/user.model';
import { UserFollow } from './user/userFollow.model';

class CamelCaseNamingStrategy extends AbstractNamingStrategy {
  classToTableName(entityName: string) {
    return entityName[0].toLowerCase() + entityName.slice(1);
  }
  joinColumnName(propertyName: string) {
    return propertyName + 'Id';
  }
  joinKeyColumnName(entityName: string, referencedColumnName?: string) {
    const column = referencedColumnName || this.referenceColumnName();
    return (
      this.classToTableName(entityName) +
      column[0].toUpperCase() +
      column.slice(1)
    );
  }
  joinTableName(sourceEntity: string, targetEntity: string) {
    return (
      this.classToTableName(sourceEntity) +
      targetEntity[0].toUpperCase() +
      targetEntity.slice(1)
    );
  }
  propertyToColumnName(propertyName: string) {
    return propertyName;
  }
  referenceColumnName() {
    return 'id';
  }
}

export const dbPromise = MikroORM.init({
  namingStrategy: CamelCaseNamingStrategy,
  entities: [
    Article,
    ArticleTag,
    UserArticleFavorite,
    Comment,
    Tag,
    User,
    UserFollow,
  ],
  type: 'postgresql',
  clientUrl: config.dbUrl,
  metadataProvider: TsMorphMetadataProvider,
});
