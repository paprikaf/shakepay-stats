import * as E from "fp-ts/Either";
import * as Next from "next";
import * as TE from "fp-ts/TaskEither";
import * as t from "lib/io-ts";

import { flow, pipe } from "fp-ts/function";

import connect from "next-connect";
import csv from "csv-parser";
import { failure as formatValidationErrors } from "io-ts/PathReporter";
import fs from "fs";
import { map } from "fp-ts/lib/Functor";
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
  t.taggedUnionMember("ParseError"),
]);

const UploadError = t.createStructuredTaggedUnion(UploadErrorT);
export type UploadError = t.TypeOf<typeof UploadErrorT>;

const readFile = (fileName: string) =>
  TE.tryCatch(
    () => {
      // TODO: handle error?
      return new Promise((resolve, reject) => {
        const stream: any[] = [];

        fs.createReadStream(fileName)
          .pipe(csv())
          .on("data", (data) => stream.push(data))
          .on("error", reject)
          .on("end", () => {
            resolve(stream);
          });
      });
    },
    (_) => UploadError.ParseError({})
  );

const Upload = t.type(
  {
    fieldname: t.string,
    originalname: t.string,
    encoding: t.string,
    mimetype: t.string,
    destination: t.string,
    filename: t.string,
    path: t.string,
    size: t.number,
  },
  "Upload"
);

interface Upload extends t.TypeOf<typeof Upload> {}

const Csv = t.array(
  t.type({
    id: t.string,
    firstName: t.string,
    lastName: t.string,
    country: t.string,
    lastLogin: t.string,
  }),
  "Csv"
);

interface Csv extends t.TypeOf<typeof Csv> {}

const handler = connect({
  onNoMatch: (
    _request: Next.NextApiRequest,
    response: Next.NextApiResponse<unknown>
  ) => {
    response.status(404).json({ error: "Not found" });
  },
});

handler.use(
  multer({
    dest: "tmp/",
  }).single("csv_file")
);

/**
 * We have to specify that the request holds a potential uploaded file.
 * To be safe, we can't assume its type until we decode it, similar to how we should be decoding a request body.
 */
handler.post<{ file?: unknown }>((request, response) => {
  pipe(
    request.file,
    E.fromNullable(UploadError.NoFile({})),
    TE.fromEither,
    TE.chainEitherK(
      flow(
        Upload.decode,
        E.mapLeft((errors) => UploadError.DecodeError({ value: { errors } }))
      )
    ),
    TE.chain((file) => readFile(file.path)),
    TE.chainEitherK(
      flow(
        Csv.decode,
        E.mapLeft((errors) => UploadError.DecodeError({ value: { errors } }))
      )
    ),
    TE.mapLeft(
      flow(
        UploadError.match({
          ParseError: () => ({
            statusCode: 400,
            body: {
              error: "Parse error",
            },
          }),
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
        (descriptor) => {
          response.status(descriptor.statusCode).json(descriptor.body);
        }
      )
    ),
    TE.map((csv) => {
      response.json(csv);
    })
  )();
});

export default handler;

export const config = {
  api: {
    bodyParser: false,
  },
};
