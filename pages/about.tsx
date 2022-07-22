import React, { useEffect } from 'react';
import * as Errors from 'lib/Errors';
import * as RemoteData from '@devexperts/remote-data-ts';
import { pipe } from 'fp-ts/function';
import { fetchJSON } from 'fp-fetch';
import * as Btc from 'pages/api/btcOperations';
import NavBarComponent from 'components/navBarComponent';

type BtcPriceRemoteData = RemoteData.RemoteData<
  Errors.NetworkError,
  number
>;
const currentBtcprice = pipe(
  fetchJSON<Errors.NetworkError, Response>(Btc.shakepayRatesUrl),
  Btc.liveBTCCADprice
);

export default function About() {
  const [btcPrice, setBtcPrice] = React.useState<BtcPriceRemoteData>(
    RemoteData.initial
  );
  useEffect(() => {
    currentBtcprice
      .then((responseE) => RemoteData.fromEither(responseE))
      .then((response) => setBtcPrice(response));
  }, []);
  return (
    <div className="py-6 px-6 md:px-12">
      <div className="py-6 px-6 md:px-12 flex flex-col h-screen">
        <NavBarComponent btcPrice={btcPrice} />
        <div className="flex-grow flex flex-col">
          <p>
            {' '}
            This app is for Shakepay users that wants to know more
            about their wallet stats
          </p>
          <p>
            Your CSV file is processed on our server but we do not
            store it. We simply use the data to compute the stats
            we're showing you.{' '}
            <span className="underline">Nothing is persisted.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
