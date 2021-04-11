import { db as knex } from 'orms/knex/db';
import { Model, Page, QueryBuilder as ObjectionQueryBuilder } from 'objection';

Model.knex(knex);

export const db = knex;

export class QueryBuilder<
  M extends Model,
  R = M[]
> extends ObjectionQueryBuilder<M, R> {
  // These are necessary. You can just copy-paste them and change the
  // name of the query builder class.
  ArrayQueryBuilderType!: QueryBuilder<M, M[]>;
  SingleQueryBuilderType!: QueryBuilder<M, M>;
  NumberQueryBuilderType!: QueryBuilder<M, number>;
  PageQueryBuilderType!: QueryBuilder<M, Page<M>>;
}

export class BaseModel extends Model {
  // Both of these are needed.
  QueryBuilderType!: QueryBuilder<this>;
  static QueryBuilder = QueryBuilder;
}
