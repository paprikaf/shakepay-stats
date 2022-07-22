import React from 'react';
import BtcPriceComponent from './btcPriceComponent';
import * as RemoteData from '@devexperts/remote-data-ts';
import * as Errors from 'lib/Errors';

type BtcPriceRemoteData = RemoteData.RemoteData<
  Errors.NetworkError,
  number
>;

const NavBarComponent: React.FC<{ btcPrice: BtcPriceRemoteData }> = ({
  btcPrice,
}) => {
  return (
    <div className='flex flex-col h-screen"'>
      <nav className="flex items-center justify-between mb-12 md:mb-48">
        <span
          className="hover:text-blue-400"
          onClick={() => location.reload()}
        >
          Shakepay Stats
        </span>
        <span>
          {RemoteData.isSuccess(btcPrice) ? (
            <BtcPriceComponent price={btcPrice.value} />
          ) : null}
        </span>
        <ul className="flex items-center ml-4">
          <li>About 📜</li>
        </ul>
      </nav>
    </div>
  );
};

export default NavBarComponent;
