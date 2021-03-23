import { BaseSchema } from 'yup';

export default function validate<Schema extends BaseSchema>(
  schema: Schema,
  object: unknown,
) {
  return schema.validateSync(object, { stripUnknown: true, abortEarly: false });
}
