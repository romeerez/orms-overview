import { OrmInterface, OrmName } from 'orms/types';
import { sequelize } from 'orms/sequelize/sequelize';
import { typeorm } from 'orms/typeorm/typeorm';

export const orms: Record<OrmName, OrmInterface> = {
  sequelize,
  typeorm,
};
