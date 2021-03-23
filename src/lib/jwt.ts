import * as jwt from 'jsonwebtoken';
import config from 'config';

export const createToken = ({ id, email }: { id: number; email: string }) =>
  jwt.sign({ id: id, email: email }, config.jwtSecret);

export const verifyToken = (token: string) =>
  jwt.verify(token, config.jwtSecret);
