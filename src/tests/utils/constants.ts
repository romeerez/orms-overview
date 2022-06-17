export const isUnpatchableOrm =
  process.env.ORM === 'prisma' ||
  process.env.ORM === 'mikroorm' ||
  process.env.ORM === 'typeorm';
