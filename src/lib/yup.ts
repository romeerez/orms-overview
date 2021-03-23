import { object as yupObject } from 'yup';

export { string, boolean, array, number, reach } from 'yup';

export const object = ((schema) =>
  yupObject(schema).required().noUnknown()) as typeof yupObject;
