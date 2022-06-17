import { DataSource } from 'typeorm';
import config from '../../config';

export const dataSource = new DataSource({
  type: 'postgres',
  url: config.dbUrl,
  ssl: false,
  synchronize: false,
  // logging: ['query'],
  entities: ['src/orms/typeorm/**/*.model.ts'],
});
