import React from 'react';
import * as Errors from 'lib/Errors';
import * as Csv from 'lib/Csv';
import * as RemoteData from '@devexperts/remote-data-ts';
import * as O from 'fp-ts/Option';
import { DropzoneOptions } from 'react-dropzone';
import SubmitFormComponenet from './submitFormComponent';
import NavBarComponent from './navBarComponent';
import HeaderComponent from './headerComponent';

type UploadRemoteData = RemoteData.RemoteData<
  Errors.NetworkError,
  Csv.Response
>;
type btcPriceRemoteData = RemoteData.RemoteData<
  Errors.NetworkError,
  number
>;
type dropZoneType = DropzoneOptions['onDrop'];
const InitialComponent: React.FC<{
  handleSubmit: React.FormEventHandler<HTMLFormElement>;
  file: O.Option<File>;
  upload: UploadRemoteData;
  onDrop: dropZoneType;
  btcPrice: btcPriceRemoteData;
}> = ({ file, upload, handleSubmit, onDrop, btcPrice }) => {
  return (
    <div className="py-6 px-6 md:px-12 flex flex-col h-screen">
      <NavBarComponent btcPrice={btcPrice} />
      <div className="flex-grow flex flex-col">
        <HeaderComponent />
        <SubmitFormComponenet
          file={file}
          upload={upload}
          handleSubmit={handleSubmit}
          onDrop={onDrop}
        />
      </div>
    </div>
  );
};

export default InitialComponent;
