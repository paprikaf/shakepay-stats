import * as Csv from 'lib/Csv';
import * as E from 'fp-ts/Either';
import * as Errors from 'lib/Errors';
import * as Next from 'next';
import * as Response from 'lib/Response';
import * as TE from 'fp-ts/TaskEither';
import * as t from 'lib/io-ts';

import { flow, pipe } from 'fp-ts/function';

import connect from 'next-connect';
import csv from 'csv-parser';
import fs from 'fs';
import multer from 'multer';

import { stats } from './stats';

const validate = <I, A>(codec: t.Decoder<I, A>) =>
  flow(
    codec.decode,
    E.mapLeft((errors) =>
      Errors.APIUpload.DecodeError({ value: { errors } })
    )
  );

// import { readFileSync } from 'fs';
// import path from 'path';

// export default function handler(req, res) {
//   const file = path.join(process.cwd(), 'files', 'test.json');
//   const stringified = readFileSync(file, 'utf8');

//   res.setHeader('Content-Type', 'application/json');
//   return res.end(stringified);
// }
// process.cwd()

const readFile = (fileName: string) =>
  TE.tryCatch(
    () => {
      return new Promise((resolve, reject) => {
        const stream: unknown[] = [];
        fs.createReadStream(fileName)
          .pipe(csv())
          .on('data', (data) => stream.push(data))
          .on('error', reject)
          .on('end', () => {
            resolve(stream);
          });
      });
    },
    (_) => Errors.APIUpload.CsvParseError({})
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
  'Upload'
);

interface Upload extends t.TypeOf<typeof Upload> {}

export const handler = connect({
  onNoMatch: (
    _request: Next.NextApiRequest,
    response: Next.NextApiResponse<unknown>
  ) => {
    response.status(404).json({ error: 'Not found' });
  },
});

// TODO: when a bad field name is sent the error is sent back as plain text, we need JSON here.
handler.use(
  multer({
    dest: 'tmp/', //Vercel Production Error: EROFS: read-only file system, mkdir '/var/task/tmp'
  }).single(Csv.fieldName)
);

/**
 * We have to specify that the request holds a potential uploaded file.
 * To be safe, we can't assume its type until we decode it, similar to how we should be decoding a request body.
 */
handler.post<{ file?: unknown }>((request, response) => {
  const sendResponse = pipe(
    request.file,
    E.fromNullable(Errors.APIUpload.NoFile({})),
    TE.fromEither,
    TE.chainEitherK(validate(Upload)),
    TE.chain((file) => readFile(file.path)),
    TE.chainEitherK(validate(t.array(Csv.CsvT))),
    // TE.chain(stats),
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
