import { Model, DataTypes } from 'sequelize';
import { db } from 'orms/sequelize/sequelize';
import { Tag as TagType } from 'app/article/article.types';
import { ArticleTag } from 'orms/sequelize/article/articleTag.model';

type CreateTag = Omit<TagType, 'id'>;

export class Tag extends Model<TagType, CreateTag> implements TagType {
  id!: number;
  tag!: string;
}

Tag.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tag: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'tag',
    sequelize: db,
  },
);

Tag.hasMany(ArticleTag as any, {
  as: 'articleTags',
  sourceKey: 'id',
  foreignKey: 'tagId',
});

ArticleTag.belongsTo(Tag, {
  as: 'tag',
  foreignKey: 'tagId',
});
