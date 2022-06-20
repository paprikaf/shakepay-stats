import * as t from "lib/io-ts";

import { StatusCodes } from "http-status-codes";

export const APIUploadT = t.createTaggedUnion([
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
  t.taggedUnionMember("ThirdPartyApiError", t.string),
]);

export const APIUpload = t.createStructuredTaggedUnion(APIUploadT);
export type APIUpload = t.TypeOf<typeof APIUploadT>;

export const APIError = t.type(
  {
    status: t.stringEnum(StatusCodes, "StatusCodes"),
    error: t.string,
  },
  "APIError"
);
export interface APIError extends t.TypeOf<typeof APIError> {}

export const NetworkErrorT = t.createTaggedUnion([
  t.taggedUnionMember(
    "FetchError",
    t.type({ error: t.assertion<TypeError>() })
  ),
  // t.taggedUnionMember(APIError.name, APIError),
  t.taggedUnionMember(
    "UnknownAPIError",
    t.type({
      error: t.string,
    })
  ),
]);

export type NetworkError = t.TypeOf<typeof NetworkErrorT>;

export const NetworkError = t.createStructuredTaggedUnion(NetworkErrorT);
