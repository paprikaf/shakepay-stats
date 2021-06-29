import * as E from "fp-ts/Either";
import * as Next from "next";
import * as Response from "lib/Response";
import * as t from "lib/io-ts";

import { flow, pipe } from "fp-ts/function";

import connect from "next-connect";
import csv from "fast-csv";
import { failure as formatValidationErrors } from "io-ts/PathReporter";
import multer from "multer";

const UploadErrorT = t.createTaggedUnion([
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
]);

const UploadError = t.createStructuredTaggedUnion(UploadErrorT);
export type UploadError = t.TypeOf<typeof UploadErrorT>;

const unimplemented = () => {
  throw new Error("Unimplemented");
};

const Upload = t.type(
  {
    fieldname: t.string,
    originalname: t.string,
    encoding: t.string,
    mimetype: t.string,
    buffer: t.assertion<Buffer>(),
  },
  "Upload"
);

interface Upload extends t.TypeOf<typeof Upload> {}

const Csv = t.array(t.type({ a: t.string }), "Csv");
interface Csv extends t.TypeOf<typeof Csv> {}

const CsvFromString = new t.Type<Csv, string, string>(
  "CsvFromString",
  Csv.is,
  (i, c) => {
    try {
      return t.success(i);
      // return pipe(Parser(i, { columns: true }), (rows) =>
      //   Csv.validate(rows, c)
      // );
    } catch (e) {
      return t.failure(i, c);
    }
  },
  // TODO: implement
  unimplemented
);

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = connect({
  onNoMatch: (
    _request: Next.NextApiRequest,
    response: Next.NextApiResponse<unknown>
  ) => {
    response.status(404).json({ error: "Not found" });
  },
});

handler.use(multer({ storage: multer.memoryStorage() }).single("csv_file"));

/**
 * We have to specify that the request holds a potential uploaded file.
 * To be safe, we can't assume its type until we decode it, similar to how we should be decoding a request body.
 */
handler.post<{ file?: unknown }>((request, response) => {
  pipe(
    request.file,
    E.fromNullable(UploadError.NoFile({})),
    E.chain(
      flow(
        Upload.decode,
        E.mapLeft((errors) => UploadError.DecodeError({ value: { errors } }))
      )
    ),
    E.fold<UploadError, Upload, Response.Descriptor<Upload>>(
      UploadError.match({
        DecodeError: ({ value }) => ({
          statusCode: 400,
          body: {
            error:
              "Invalid file: " +
              formatValidationErrors(value.errors).join("; "),
          },
        }),
        NoFile: () => ({
          statusCode: 400,
          body: {
            error: "file not found",
          },
        }),
      }),
      (file) => ({
        statusCode: 200,
        body: file,
      })
    ),
    ({ statusCode, body }) => {
      response.status(statusCode).json(body);
    }
  );
});

export default handler;
