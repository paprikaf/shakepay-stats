import * as Next from "next";
import * as Request from "server/Request";
import * as TE from "fp-ts/TaskEither";
import * as t from "io-ts";

import csv from "fast-csv";
import multer from "multer";
import { pipe } from "fp-ts/function";

const unimplemented = () => {
  throw new Error("Unimplemented");
};

type Middleware = (
  request: Next.NextApiRequest,
  response: Next.NextApiResponse<unknown>,
  result: (result: unknown) => void
) => void;

function runMiddleware(middleware: Middleware) {
  return (
    request: Next.NextApiRequest,
    response: Next.NextApiResponse
  ): TE.TaskEither<
    Error,
    { request: Next.NextApiRequest; response: Next.NextApiResponse<unknown> }
  > => {
    return TE.tryCatch(
      () =>
        new Promise((resolve, reject) => {
          middleware(request, response, (result) => {
            if (result instanceof Error) {
              return reject(result);
            }
            return resolve({ request, response });
          });
        }),
      (_) => new Error("Middleware failed to run")
    );
  };
}

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

const runUpload = pipe(
  multer({ storage: multer.memoryStorage() }).single(
    "csv_file"
    // We must cast because of type issues between the Node Request/Response interfaces and Next.
  ) as unknown as Middleware,
  runMiddleware
);

async function handler(
  _request: Next.NextApiRequest,
  _response: Next.NextApiResponse<unknown>
) {
  await pipe(
    runUpload(_request, _response),
    TE.map(({ request, response }) => {
      console.log("yolo", request.file);
    })
  )();

  _response.send({});
}

export default handler;
