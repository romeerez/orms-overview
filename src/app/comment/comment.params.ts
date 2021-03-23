import { number, string } from 'lib/yup';

export const commentParams = {
  id: number(),
  body: string().min(5).max(100000),
};
