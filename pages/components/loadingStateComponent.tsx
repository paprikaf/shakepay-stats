import React from 'react';
import * as RemoteData from '@devexperts/remote-data-ts';
import * as Errors from 'lib/Errors';
import NavBarComponent from './navBarComponent';
import classnames from 'classnames';
import styles from 'pages/Home.module.css';

type BtcPriceRemoteData = RemoteData.RemoteData<
  Errors.NetworkError,
  number
>;

const LoadingComponenet: React.FC<{
  btcPrice: BtcPriceRemoteData;
}> = ({ btcPrice }) => {
  return (
    <div className="py-6 px-6 md:px-12 flex flex-col h-screen">
      <NavBarComponent btcPrice={btcPrice} />
      <div className="flex-grow flex flex-col">
        <div className="transition duration-1000 delay-500 hover:delay-0 w-2">
          <div>
            <div
              // wire:loading
              className={classnames(
                'fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-gray-700 opacity-75 flex flex-col items-center justify-center'
              )}
            >
              <div
                className={classnames(
                  'loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4',
                  styles.loader
                )}
              ></div>
              <h2 className="text-center text-white text-xl font-semibold">
                crunshing numbers 💬
              </h2>
              <p className="w-1/3 text-center text-white">
                This may take a few seconds, please don't close this
                page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingComponenet;
