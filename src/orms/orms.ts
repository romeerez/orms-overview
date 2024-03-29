import { OrmInterface, OrmName } from 'orms/types';
import { sequelize } from 'orms/sequelize/sequelize';
import { typeorm } from 'orms/typeorm/typeorm';
import { knex } from 'orms/knex/knex';
import { prisma } from 'orms/prisma/prisma';
import { objection } from 'orms/objection/objection';
import { mikroorm } from 'orms/mikroorm/mikroorm';
import { orchidOrm } from 'orms/orchid-orm/orchid-orm';

export const orms: Record<OrmName, OrmInterface> = {
  sequelize,
  typeorm,
  knex,
  prisma,
  objection,
  mikroorm,
  'orchid-orm': orchidOrm,
};
