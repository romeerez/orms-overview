import { OrmInterface, OrmName } from 'orms/types';
import { sequelize } from 'orms/sequelize/sequelize';
import { typeorm } from 'orms/typeorm/typeorm';
import { knex } from 'orms/knex/knex';
import { prisma } from 'orms/prisma/prisma';
import { objection } from 'orms/objection/objection';

export const orms: Record<OrmName, OrmInterface> = {
  sequelize,
  typeorm,
  knex,
  prisma,
  objection,
};
