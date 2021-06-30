import * as t from "lib/io-ts";

export const UploadT = t.createTaggedUnion([
  t.taggedUnionMember(
    "DecodeError",
    t.type(
      {
        errors: t.assertion<t.Errors>(),
      },
      "DecodeError"
    )
  ),
  t.taggedUnionMember("NoFile"),
  t.taggedUnionMember("CsvParseError"),
]);

export const Upload = t.createStructuredTaggedUnion(UploadT);
export type Upload = t.TypeOf<typeof UploadT>;
