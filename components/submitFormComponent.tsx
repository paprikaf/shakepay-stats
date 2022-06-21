import React from 'react';
import * as O from 'fp-ts/Option';
import * as RemoteData from '@devexperts/remote-data-ts';
import * as Csv from 'lib/Csv';
import * as Errors from 'lib/Errors';
import { pipe } from 'fp-ts/function';
import { DropzoneOptions } from 'react-dropzone';
import CreditsComponents from './creditsComponents';
import DropZoneComponent from './dropZoneComponent';
import FileIcon from './fileIconComponent';

type UploadRemoteData = RemoteData.RemoteData<
  Errors.NetworkError,
  Csv.Response
>;
type dropZoneType = DropzoneOptions['onDrop'];

const SubmitFormComponenet: React.FC<{
  handleSubmit: React.FormEventHandler<HTMLFormElement>;
  file: O.Option<File>;
  upload: UploadRemoteData;
  onDrop: dropZoneType;
}> = ({ handleSubmit, file, onDrop, upload }) => {
  return (
    <form
      encType="multipart/form-data"
      method="post"
      action="/api/csv"
      onSubmit={handleSubmit}
      className="flex flex-col mt-8 flex-grow"
    >
      <div className="border-dashed border-2 border-gray-200 flex-grow flex flex-col justify-center">
        {pipe(
          file,
          O.map((f) => (
            <div className="flex justify-center" key="lol">
              <div className="flex flex-col relative">
                <div className="bg-blue-200 py-4 px-2 rounded justify-center grid place-items-center">
                  <FileIcon />
                  <div className="mt-2 text-center">{f.name}</div>
                </div>
                <button
                  type="submit"
                  className="bg-green-300 px-4 py-1 rounded text-black self-center mt-4 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={RemoteData.isPending(upload)}
                >
                  Upload
                </button>
              </div>
            </div>
          )),
          O.getOrElse(() => <DropZoneComponent onDrop={onDrop} />)
        )}
      </div>
      <CreditsComponents />
    </form>
  );
};

export default SubmitFormComponenet;
