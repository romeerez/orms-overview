import { db as knex } from 'orms/knex/db';
import { Model } from 'objection';

Model.knex(knex);

export const db = knex;
