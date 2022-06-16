import { RequestHandler } from 'types';
import * as response from 'app/tag/tag.response';

export const listTags: RequestHandler = async (request) => {
  const tags = await request.orm.tagRepo.listTags(request.meta);
  return response.tags(tags);
};
