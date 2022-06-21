import React from 'react';
import NavBarComponent from './navBarComponent';
import * as RemoteData from '@devexperts/remote-data-ts';
import * as Errors from 'lib/Errors';
import * as Csv from 'lib/Csv';
import StatsDashBoardComponent from './statsDashBoardComponent';

type UploadRemoteData = RemoteData.RemoteData<
  Errors.NetworkError,
  Csv.Response
>;
type btcPriceRemoteData = RemoteData.RemoteData<
  Errors.NetworkError,
  number
>;
//TODO: work on the design for this componenet
const SuccessComponent: React.FC<{
  btcPrice: btcPriceRemoteData;
  response: UploadRemoteData;
}> = ({ btcPrice, response }) => {
  return (
    <div>
      <NavBarComponent btcPrice={btcPrice} />
      <div className="flex-grow flex flex-col">
        {RemoteData.isSuccess(response) ? (
          <StatsDashBoardComponent {...response.value} />
        ) : null}
      </div>
    </div>
  );
};

export default SuccessComponent;
