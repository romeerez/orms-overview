import { createBaseTable } from 'orchid-orm';
import { columnTypes } from 'pqb';

export const BaseTable = createBaseTable({
  columnTypes: {
    ...columnTypes,
    text: (min = 0, max = Infinity) => columnTypes.text(min, max),
    timestamp() {
      return columnTypes.timestamp().parse((input) => new Date(input));
    },
  },
});
