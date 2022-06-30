import * as A from 'fp-ts/Array';
import * as Csv from 'lib/Csv';
import * as Btc from 'pages/api/btcOperations';
import * as Errors from 'lib/Errors';
import * as O from 'fp-ts/Option';
import * as RemoteData from '@devexperts/remote-data-ts';
import * as TE from 'fp-ts/TaskEither';

import { DropzoneOptions } from 'react-dropzone';
import { identity, pipe } from 'fp-ts/function';
import { fetchJSON } from 'fp-fetch';
import React, { useEffect } from 'react';
import FailureComponent from 'components/failureStateComponenet';
import InitialComponent from 'components/initialStateComponent';
import LoadingComponenet from 'components/loadingStateComponent';
import SuccessComponent from 'components/successStateComponent';
import { StatusCodes } from 'http-status-codes';

type UploadRemoteData = RemoteData.RemoteData<
  Errors.NetworkError,
  Csv.Response
>;
type BtcPriceRemoteData = RemoteData.RemoteData<
  Errors.NetworkError,
  number
>;

const currentBtcprice = pipe(
  fetchJSON<Errors.NetworkError, Response>(Btc.shakepayRatesUrl),
  Btc.liveBTCCADprice
);
const upload = (
  file: File
): TE.TaskEither<Errors.NetworkError, Response> =>
  TE.tryCatch(
    () => {
      const data = new FormData();
      data.append(Csv.fieldName, file);
      return fetch('/api/csv', {
        method: 'POST',
        body: data,
      });
    },
    (error) =>
      error instanceof TypeError
        ? Errors.NetworkError.FetchError({ value: { error } })
        : Errors.NetworkError.APIError({
            value: {
              status: StatusCodes.BAD_REQUEST,
              error: 'Unknown error occurred',
            },
          })
  );

export default function Home() {
  const [file, setFile] = React.useState<O.Option<File>>(O.none);
  const [request, setRequest] = React.useState<UploadRemoteData>(
    RemoteData.initial
  );
  const [btcPrice, setBtcPrice] = React.useState<BtcPriceRemoteData>(
    RemoteData.initial
  );
  useEffect(() => {
    currentBtcprice
      .then((responseE) => RemoteData.fromEither(responseE))
      .then((response) => setBtcPrice(response));
  }, []);
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (
    event
  ) => {
    event.preventDefault();
    setRequest(RemoteData.pending);

    pipe(
      file,
      O.fold(() => {
        throw new Error('Expected to have a file');
      }, identity),
      TE.of,
      TE.chain(upload),
      TE.chain((response) =>
        TE.tryCatch(
          () => response.json(),
          (_error) =>
            Errors.NetworkError.APIError({
              value: {
                status: StatusCodes.BAD_REQUEST,
                error: 'Could Not Decode Csv file',
              },
            })
        )
      ),
      TE.map((body: Csv.Response) =>
        setRequest(RemoteData.success(body))
      ),
      TE.mapLeft((error) => setRequest(RemoteData.failure(error)))
    )();
    console.log('request', request);
  };
  type dropZoneType = DropzoneOptions['onDrop'];
  const onDrop: dropZoneType = (acceptedFiles) => {
    pipe(acceptedFiles, A.head, setFile);
  };

  return (
    <div className="py-6 px-6 md:px-12">
      {pipe(
        request,
        RemoteData.fold(
          () => (
            <InitialComponent
              file={file}
              upload={request}
              btcPrice={btcPrice}
              handleSubmit={handleSubmit}
              onDrop={onDrop}
            />
          ),
          () => <LoadingComponenet btcPrice={btcPrice} />,
          () => <FailureComponent btcPrice={btcPrice} />,
          () => (
            <SuccessComponent
              btcPrice={btcPrice}
              response={request}
            />
          )
        )
      )}
    </div>
  );
}
