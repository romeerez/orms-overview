import { OrmInterface, OrmName } from 'orms/types';
import { sequelize } from 'orms/sequelize/sequelize';

export const orms: Record<OrmName, OrmInterface> = {
  sequelize,
};
