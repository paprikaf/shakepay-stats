import * as E from "fp-ts/Either";
import * as Errors from "lib/Errors";
import * as Next from "next";
import * as Response from "lib/Response";
import * as TE from "fp-ts/TaskEither";
import * as t from "lib/io-ts";

import { flow, pipe } from "fp-ts/function";

import connect from "next-connect";
import csv from "csv-parser";
import fs from "fs";
import multer from "multer";

const validate = <I, A>(codec: t.Decoder<I, A>) =>
  flow(
    codec.decode,
    E.mapLeft((errors) => Errors.Upload.DecodeError({ value: { errors } }))
  );

const readFile = (fileName: string) =>
  TE.tryCatch(
    () => {
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
    (_) => Errors.Upload.CsvParseError({})
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
  const sendResponse = pipe(
    request.file,
    E.fromNullable(Errors.Upload.NoFile({})),
    TE.fromEither,
    TE.chainEitherK(validate(Upload)),
    TE.chain((file) => readFile(file.path)),
    TE.chainEitherK(validate(Csv)),
    TE.mapLeft(
      flow(Response.fromUploadError, (descriptor) => {
        response.status(descriptor.status).json(descriptor);
      })
    ),
    TE.map(response.json)
  );

  sendResponse();
});

export default handler;

export const config = {
  api: {
    bodyParser: false,
  },
};
