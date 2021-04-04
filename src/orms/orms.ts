import { OrmInterface, OrmName } from 'orms/types';
import { sequelize } from 'orms/sequelize/sequelize';
import { typeorm } from 'orms/typeorm/typeorm';
import { prisma } from 'orms/prisma/prisma';

export const orms: Record<OrmName, OrmInterface> = {
  sequelize,
  typeorm,
  prisma,
};
