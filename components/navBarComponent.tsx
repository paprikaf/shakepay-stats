import React from 'react';
import BtcPriceComponent from './btcPriceComponent';
import * as RemoteData from '@devexperts/remote-data-ts';
import * as Errors from 'lib/Errors';
import Link from 'next/link';

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
        <div className="inline-block">
          <div className="flex flex-wrap justify-center ">
            <img
              className="w-5 h-5"
              src="/favicon.ico"
              alt="BitcoinLogo"
            />
            <Link href="/">
              <span className="hover:text-red-400">
                Shakepay Stats
              </span>
            </Link>
          </div>
        </div>
        <span>
          {RemoteData.isSuccess(btcPrice) ? (
            <BtcPriceComponent price={btcPrice.value} />
          ) : null}
        </span>
        <ul className="flex items-center ml-4">
          <li>
            <Link href="/about">About 📜</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default NavBarComponent;
