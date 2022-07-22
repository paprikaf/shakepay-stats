import * as Csv from 'lib/Csv';
import * as E from 'fp-ts/Either';
import * as Errors from 'lib/Errors';
import * as Next from 'next';
import * as Response from 'lib/Response';
import * as TE from 'fp-ts/TaskEither';
import * as t from 'lib/io-ts';
import { flow, pipe } from 'fp-ts/function';

import connect from 'next-connect';
import multer from 'multer';

import { stats } from './stats';

const csvToJson = require('csvtojson');

const validate = <I, A>(codec: t.Decoder<I, A>) =>
  flow(
    codec.decode,
    E.mapLeft((errors) =>
      Errors.APIUpload.DecodeError({ value: { errors } })
    )
  );

const parseFile = (input: any) => {
  return TE.tryCatch(
    async () => {
      const result = await csvToJson().fromString(input.toString());
      return result;
    },
    (_) => Errors.APIUpload.CsvParseError({})
  );
};

// const readFile = (fileName: string) =>
//   TE.tryCatch(
//     () => {
//       return new Promise((resolve, reject) => {
//         const stream: unknown[] = [];
//         fs.createReadStream(fileName)
//           .pipe(csv())
//           .on('data', (data) => stream.push(data))
//           .on('error', reject)
//           .on('end', () => {
//             resolve(stream);
//           });
//       });
//     },
//     (_) => Errors.APIUpload.CsvParseError({})
//   );

const Upload = t.type(
  {
    fieldname: t.string,
    originalname: t.string,
    encoding: t.string,
    mimetype: t.string,
    // destination: t.string, //not needed anymore switiching to memeroy storage
    // filename: t.string, //not needed anymore switiching to memeroy storage
    // path: t.string, //not needed anymore switiching to memeroy storage
    size: t.number,
    buffer: t.unknown,
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

const storage = multer.memoryStorage();
// TODO: when a bad field name is sent the error is sent back as plain text, we need JSON here.
handler.use(
  multer({
    // dest: 'tmp/', //Vercel Production Error: EROFS: read-only file system, mkdir '/var/task/tmp'
    storage: storage,
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
    // TE.chain((file) => readFile(file.path)),
    TE.chain((file) => parseFile(file.buffer)),
    TE.chainEitherK(validate(t.array(Csv.CsvT))),
    TE.chain(stats),
    TE.mapLeft(
      flow(Response.fromUploadError, (descriptor) => {
        response.redirect(descriptor.status, '').json(descriptor);
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
