import { array, string } from 'lib/yup';

export const articleParams = {
  slug: string(),
  title: string().min(5).max(150),
  description: string().min(5).max(500),
  body: string().min(5).max(100000),
  tagList: array().of(string().min(2).max(20).required()),
};
