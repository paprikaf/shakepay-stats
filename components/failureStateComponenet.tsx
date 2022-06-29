import React from 'react';
import * as RemoteData from '@devexperts/remote-data-ts';
import * as Errors from 'lib/Errors';
import classnames from 'classnames';
import NavBarComponent from './navBarComponent';

type BtcPriceRemoteData = RemoteData.RemoteData<
  Errors.NetworkError,
  number
>;

const FailureComponent: React.FC<{
  btcPrice: BtcPriceRemoteData;
}> = ({ btcPrice }) => {
  return (
    <div className="py-6 px-6 md:px-12 flex flex-col h-screen">
      <NavBarComponent btcPrice={btcPrice} />
      <div className="flex-grow flex flex-col">
        <div className="transition duration-1000 delay-500 hover:delay-0 w-2">
          <div>
            <div
              className={classnames(
                'fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-gray-700 opacity-75 flex flex-col items-center justify-center'
              )}
            >
              <div>
                <img
                  src="https://tenor.com/view/sad-cute-alone-wagging-tail-gif-16369828"
                  alt=""
                />
              </div>
              <h2 className="text-center text-red text-xl font-semibold">
                Sorry 😿
              </h2>
              <p className="w-1/3 text-center text-white">
                something went wrong unable to fetch your data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FailureComponent;
