import { createModel } from 'porm';
import { columnTypes } from 'pqb';

export const Model = createModel({
  columnTypes: {
    ...columnTypes,
    timestamp() {
      return columnTypes.timestamp().parse((input) => new Date(input));
    },
  },
});
