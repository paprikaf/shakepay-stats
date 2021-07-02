import * as t from "lib/io-ts";

export const fieldName = "csv_file";

export const Csv = t.array(
  t.type({
    id: t.string,
    firstName: t.string,
    lastName: t.string,
    country: t.string,
    lastLogin: t.string,
  }),
  "Csv"
);

export interface Csv extends t.TypeOf<typeof Csv> {}
