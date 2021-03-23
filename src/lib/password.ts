import { genSalt, hash, compare } from 'bcrypt';

export const encryptPassword = async (password: string) => {
  const salt = await genSalt(10);
  return await hash(password, salt);
};

export const comparePassword = async (password: string, encrypted: string) =>
  await compare(password, encrypted);
